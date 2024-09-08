import { userModel } from "../../database/models/user.model.js"
import { AppError } from "../../utils/error.js"
import { messages } from "../../utils/index.js"

export const addWishlist = async (req, res, next) => {
    // get data from req 
    const { productId } = req.body

    // add product to wishlist 
    const updatedUser = await userModel.findByIdAndUpdate(req.authUser._id, { $addToSet: { wishlist: productId } }, { new: true }) // addToSet is an array operator in mongosh to add a unique item (don't add the same item again)
    if (!updatedUser) {
        return next(new AppError("couldn't update your wishlist ", 500))
    }
    return res.status(200)
        .json({
            message: `${productId} added to wishlist successfully`,
            data: updatedUser
        })
}

export const getWishlist = async (req, res, next) => {
    const user = await userModel.findById(req.authUser._id, { wishlist: 1 }, { populate: [{ path: "wishlist" }] })
    if (!user) {
        return next(new AppError("couldn't get your wishlist", 500))
    }
    return res.status(200).json({ data: user })
}

export const deleteFormWishlist = async (req, res, next) => {
    // get data from req
    const { productId } = req.params

    const wishlist = await userModel.findByIdAndUpdate(req.authUser._id, { $pull: { wishlist: productId } }, { new: true }).select("wishlist")
    // send res
    return res.status(200).json({ message: `${productId} removed from wishlist successfully`, data: wishlist })
}   