import express from 'express';
import dbConnection from './database/db_Connection.js';
// import brandRouter from './modules/brand/brand.routes.js'
// import categoryRouter from './modules/category/category.routes.js'
// import productRouter from './modules/product/product.routes.js'
// import subcategoryRouter from './modules/subcategory/subcategory.routes.js'
import dotenv from 'dotenv';
import path from 'path';
import Stripe from 'stripe';
import { cartModel, orderModel, productModel } from './database/index.js';
import { authRouter, brandRouter, cartRouter, categoryRouter, couponRouter, productRouter, reviewRouter, subcategoryRouter, wishlistRouter } from './modules/index.js';
import orderRouter from './modules/order/order.routes.js';
import { AppError, catchAsyncError, globalError } from './utils/error.js';

const fullPath = path.resolve("./utils/config//.env")
dotenv.config({ path: fullPath });

dbConnection()
const app = express()
const port = process.env.port || 3000

///////////////////////// (stripe webhook with checkout.session.completed event) //////////////////////////
app.post('/webhook', express.raw({ type: 'application/json' }), catchAsyncError(async (req, res) => {
    const sig = req.headers['stripe-signature'].toString();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    let event;

    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOiNTSECRET);

    // Handle the event
    if (event.type == "checkout.session.completed") {
        const checkoutSessionCompleted = event.data.object;
        // clear user cart
        const orderId = checkoutSessionCompleted.metadata.orderId;
        // update order status to -> "placed"
        const orderExist = await orderModel.findByIdAndUpdate(orderId, { status: "placed" }, { new: true });
        // product stock  
        await cartModel.findOneAndUpdate({ user: orderExist.user }, { products: [] }, { new: true });
        for (const product of orderExist.products) {
            await productModel.findByIdAndUpdate(product.productId, { $inc: { stock: -product.quantity } });
        }
    }

    // Return a 200 res to acknowledge receipt of the event
    res.send();
}));
///////////////////////// (stripe webhook with checkout.session.completed event) //////////////////////////

app.use(express.json())
app.use("/uploads", express.static('./uploads'))

app.use('/api/categories', categoryRouter)
app.use('/api/sub-categories', subcategoryRouter)
app.use('/api/brands', brandRouter)
app.use('/api/products', productRouter)
app.use('/api/auth', authRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/cart', cartRouter)
app.use('/api/coupons', couponRouter)
app.use('/api/orders', orderRouter)

app.get('/', (req, res, next) => {
    res.json({ message: "Hello World!" })
})

app.use('*', (req, res, next) => {
    next(new AppError(`Route Not Found: ${req.originalUrl}`, 404))
})
app.use(globalError)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
