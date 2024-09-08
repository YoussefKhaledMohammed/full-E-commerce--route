import dotenv from "dotenv";
import path from "path";
import Stripe from "stripe";
import { cartModel } from './../../database/models/cart.model.js';
import { couponModel } from './../../database/models/coupon.model.js';
import { orderModel } from './../../database/models/order.model.js';
import { productModel } from './../../database/models/product.model.js';
import { messages } from './../../utils/constant/messages.js';
import { AppError } from './../../utils/error.js';

const fullPath = path.resolve("../../utils/config/.env")
dotenv.config({ path: fullPath });

export const createOrder = async (req, res, next) => {
    // get data from body 
    const { phone, street, code, paymentMethod } = req.body

    // check coupon
    let couponExist = 0
    if (code) {
        couponExist = await couponModel.findOne({ code: code })
        if (!couponExist) {
            return next(new AppError(messages.coupon.notFound, 404))
        }
    }

    // check cart 
    const cart = await cartModel.findOne({ user: req.authUser._id })
    if (!cart) {
        return next(new AppError(messages.cart.notFound, 400))
    }

    const products = cart.products

    let orderPrice = 0
    let finalPrice = 0
    let orderProducts = []
    // check products
    for (const product of products) {
        const productExist = await productModel.findById(product.productId)
        if (!productExist) {
            return next(new AppError(messages.product.notFound, 404))
        }
        if (!productExist.inStock(product.quantity)) {
            return next(new AppError("Out Of Stock", 400))
        }
        orderPrice += productExist.finalPrice * product.quantity
        orderProducts.push({
            productId: productExist._id,
            name: productExist.name,
            price: productExist.price,
            finalPrice: productExist.finalPrice,
            quantity: product.quantity,
            discount: productExist.discount
        })
    }

    couponExist.couponType == "fixedAmount" ?
        finalPrice = (orderPrice - couponExist.discount)
        : finalPrice = orderPrice - (orderPrice * ((couponExist.discount || 0) / 100))

    // create order
    const order = new orderModel({
        user: req.authUser._id,
        address: {
            phone,
            street
        },
        coupon: {
            code,
            couponId: couponExist._id,
            discount: couponExist.discount
        },
        paymentMethod,
        products: orderProducts,
        orderPrice,
        finalPrice
    })

    // add to db 
    const createdOrder = await order.save()
    if (!createOrder) {
        return next(new AppError(messages.order.failToCreate, 500))
    }

    // integrate payment method (Stripe) 
    if (paymentMethod === "visa") {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        const checkout = await stripe.checkout.sessions.create({
            success_url: "https://www.google.com", // add success url
            cancel_url: "https://www.facebook.com", // add cancel url
            payment_method_types: ["card"],
            mode: "payment",
            metadata: {
                orderId: createdOrder._id.toString()
            },
            line_items: createdOrder.products.map(product => {
                return {
                    price_data: {
                        currency: "egp",
                        product_data: {
                            name: product.name,
                            // images: [product.productId.image]
                        },
                        unit_amount: product.price * 100
                    },
                    quantity: product.quantity
                }
            })
        })

        return res.status(201).json({ message: messages.order.successCreate, data: checkout, url: checkout.url })
    }

    // return res 
    res.status(201).json({ message: messages.order.successCreate, data: createdOrder })
}
