import { productModel, reviewModel } from "../../database/index.js"
import { ApiFeature, AppError, messages } from "../../utils/index.js"

export const addReview = async (req, res, next) => {
    // get data
    const { product, rate, comment } = req.body

    // check product exist
    const productExist = await productModel.findById(product)
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }

    // todo : check user order this product

    // create review
    const review = new reviewModel({
        user: req.authUser._id,
        product,
        rate,
        comment
    })

    // save to database
    const createdReview = await review.save()
    if (!createdReview) {
        return next(new AppError(messages.review.failToCreate, 500))
    }

    // update product rate
    const rating = await reviewModel.find({ product }).select('rate')
    let avgRate = rating.reduce((acc, item) => {
        return acc += item.rate
    }, 0)
    avgRate = avgRate / rating.length

    const productRate = await productExist.updateOne({ rate: avgRate })
    if (!productRate) {
        return next(new AppError(messages.product.failToUpdate, 500))
    }
    // send res
    res.status(201).json({
        status: 'success',
        message: messages.review.successCreate,
        data: { avgRate, createdReview }
    })
}

export const getAllReviewForProduct = async (req, res, next) => {
    // get data
    const { product } = req.query

    // check product exist
    const productExist = await productModel.findById(product)
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }
    /////////////////////////
    const apiFeature = new ApiFeature(reviewModel.find({ product }), req.query)
        .pagination()

    const reviews = await apiFeature.mongooseQuery

    if (!reviews) {
        return next(new AppError(messages.review.notFound, 404))
    }
    res.status(200).json({
        status: 'success',
        message: messages.review.successFindAll,
        data: reviews,
        // metaData: { page, size, nextPage: page + 1 }
    })
    /////////////////////////

    // get all review
    // const reviews = await reviewModel.find({ product })
    // if (!reviews) {
    //     return next(new AppError(messages.review.notFound, 404))
    // }

    // // send res
    // res.status(200).json({
    //     status: 'success',
    //     data: reviews
    // })
}

export const getReview = async (req, res, next) => {
    // get data
    const { reviewId } = req.params

    // check review exist
    const reviewExist = await reviewModel.findById(reviewId)
    if (!reviewExist) {
        return next(new AppError(messages.review.notFound, 404))
    }

    // send res
    res.status(200).json({
        status: 'success',
        data: reviewExist
    })
}

export const deleteReview = async (req, res, next) => {
    // get data
    const { reviewId } = req.params

    // check review exist
    const reviewExist = await reviewModel.findById(reviewId)
    if (!reviewExist) {
        return next(new AppError(messages.review.notFound, 404))
    }

    if (req.authUser._id.toString() != reviewExist.user.toString() && req.authUser.role != 'admin') {
        return next(new AppError(messages.user.notAllowed, 401))
    }

    // delete review
    const deletedReview = await reviewModel.deleteOne({ _id: reviewId })
    if (!deletedReview) {
        return next(new AppError(messages.review.failToDelete, 500))
    }

    // update product rate
    const rating = await reviewModel.find({ product: reviewExist.product }).select('rate')
    let avgRate = rating.reduce((acc, item) => {
        return acc += item.rate
    }, 0)
    avgRate = avgRate / rating.length

    const productRate = await productModel.findByIdAndUpdate(reviewExist.product, { rate: avgRate })
    if (!productRate) {
        return next(new AppError(messages.product.failToUpdate, 500))
    }
    // send res
    res.status(201).json({
        status: 'success',
        message: messages.review.successDelete,
        data: { avgRate, deletedReview }
    })

    // // send res
    // res.status(200).json({
    //     status: 'success',
    //     message: messages.review.successDelete
    // })
}

export const updateReview = async (req, res, next) => {
    // get data 
    const { reviewId } = req.params
    const { rate, comment } = req.body

    // check review exist
    const reviewExist = await reviewModel.findById(reviewId)
    if (!reviewExist) {
        return next(new AppError(messages.review.notFound, 404))
    }

    // check user is owner of review or admin 
    if (req.authUser._id.toString() !== reviewExist.user.toString() && req.authUser.role !== 'admin') {
        return next(new AppError(messages.user.notAllowed, 401))
    }

    // update review
    const updatedReview = await reviewModel.findByIdAndUpdate(reviewId, { rate, comment }, { new: true })
    if (!updatedReview) {
        return next(new AppError(messages.review.failToUpdate, 500))
    }

    // update product rate
    const rating = await reviewModel.find({ product: reviewExist.product }).select('rate')
    let avgRate = rating.reduce((acc, item) => {
        return acc += item.rate
    }, 0)
    avgRate = avgRate / rating.length

    const productRate = await productModel.findByIdAndUpdate(reviewExist.product, { rate: avgRate })
    if (!productRate) {
        return next(new AppError(messages.product.failToUpdate, 500))
    }

    // send res
    res.status(200).json({
        status: 'success',
        message: messages.review.successUpdate,
        data: { avgRate, updatedReview }
    })
}