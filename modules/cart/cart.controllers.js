import { cartModel } from '../../database/index.js';
import { AppError, messages } from '../../utils/index.js';
import { productModel } from './../../database/models/product.model.js';

export const addToCart = async (req, res, next) => {
    // get data from req 
    const { productId, quantity } = req.body

    // check product existence
    const productExist = await productModel.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }

    // check product quantity
    if (!productExist.inStock(quantity)) {   // inStock is a method i did it in product schema
        return next(new AppError("Out of Stock", 400))
    }

    // add to cart 
    // check product is exist in cart
    let data = ""
    const productInCart = await cartModel.findOneAndUpdate({ user: req.authUser._id, 'products.productId': productId }, { "products.$.quantity": quantity }, { new: true })
    let message = messages.cart.successUpdate
    data = productInCart

    if (!productInCart) {
        const cart = await cartModel.findOneAndUpdate({ user: req.authUser._id }, { $push: { products: { productId, quantity } } }, { new: true })
        message = "product added to cart"
        data = cart
    }

    // send res
    return res.status(200).json({ message, data })
}