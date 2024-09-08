import { Types } from 'mongoose';
import slugify from 'slugify';
// import cloudinary from '../../utils/cloudinary.js';
// import { messages } from '../../utils/constant/messages.js';
// import { deleteFile } from '../../utils/deleteFile.js';
// import { AppError } from '../../utils/error.js';
import { AppError, messages, cloudinary, deleteFile, ApiFeature } from '../../utils/index.js'; // inhance import
// import { categoryModel } from './../../database/models/category.model.js';
// import { productModel } from './../../database/models/product.model.js';
// import { subcategoryModel } from './../../database/models/subcategory.model.js';
import { categoryModel, productModel, reviewModel, subcategoryModel } from '../../database/index.js'; // inhance import

export const addCategory = async (req, res, next) => {
    // get data from req
    let { name } = req.body
    name = name.trim().toLowerCase()
    // req.file

    // check if image is uploaded
    if (!req.file) {
        return next(new AppError(messages.file.required, 400))

    }
    // check existing category
    const existedCategory = await categoryModel.findOne({ name: name })
    if (existedCategory) {
        return next(new AppError(messages.category.alreadyExist, 409))
    }

    // prepare data
    const slug = slugify(name)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: "e-commerce/categories" })
    if (!secure_url || !public_id) {
        return next(new AppError(messages.file.failToUpload, 500))
    }
    const category = new categoryModel({
        name,
        slug,
        image: { secure_url: secure_url, public_id: public_id },
        createdBy: req.authUser._id
    })

    // add to database
    const createdCategory = await category.save()
    if (!createdCategory) {
        // deleteFile(req.file.path)
        await cloudinary.uploader.destroy(public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
        return next(new AppError(messages.category.failToCreate, 500))
    }

    // send res
    res.status(201).json({
        status: 'success',
        message: messages.category.successCreate,
        data: createdCategory
    })

}

export const getCategories = async (req, res, next) => {

    const apiFeature = new ApiFeature(categoryModel.aggregate([
        {
            $match: {}
        },
        {
            $lookup: {
                from: 'subcategories',
                localField: '_id',
                foreignField: 'category',
                as: 'subcategories'
            }
        }
    ]), req.query)
        .pagination()

    const categories = await apiFeature.mongooseQuery

    if (!categories) {
        next(new AppError(messages.category.failToGetAll, 500))
    }
    res.status(200).json({
        status: 'success',
        message: messages.category.successFindAll,
        data: categories,
        // metaData: { page, size, nextPage: page + 1 }
    })


    // ///////////////////////////////////////////////
    // await categoryModel.find()
    // await categoryModel.aggregate([
    //     {
    //         $match: {}
    //     },
    //     {
    //         $lookup: {
    //             from: 'subcategories',
    //             localField: '_id',
    //             foreignField: 'category',
    //             as: 'subcategories'
    //         }
    //     }
    // ])
    //     .then((categories) => {
    //         res.status(200).json({
    //             status: 'success',
    //             message: messages.category.successFindAll,
    //             data: categories
    //         })
    //     })
    //     .catch((err) => {
    //         next(new AppError("fail to get categories", 500))
    //     })
}

export const updateCategory = async (req, res, next) => {
    // get data from req
    let { name } = req.body
    const { categoryId } = req.params

    name && name.trim().toLowerCase()
    // check existing category
    const existedCategory = await categoryModel.findById(categoryId)
    if (!existedCategory) {
        return next(new AppError(messages.category.notFound, 404))
    }
    // check name exist
    const isNameExist = await categoryModel.findOne({ name: name, _id: { $ne: categoryId } })
    if (isNameExist) {
        return next(new AppError(messages.category.alreadyExist, 409))
    }

    // update data
    if (req.file) {
        // deleteFile(existedCategory.image.path)
        // delete old image from cloudinary
        await cloudinary.uploader.destroy(existedCategory.image.public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: "e-commerce/categories" })
        if (!secure_url || !public_id) {
            return next(new AppError(messages.file.failToUpload, 500))
        }
        existedCategory.image = { secure_url: secure_url, public_id: public_id }
        // existedCategory.image.path = req.file.path
        // existedCategory.image = { path: req.file.path }
    }

    if (name) {
        existedCategory.name = name
        existedCategory.slug = slugify(name)
    }

    existedCategory.updatedBy = req.authUser._id

    // update db
    const updatedCategory = await existedCategory.save()
    if (!updatedCategory) {
        // deleteFile(req.file.path)
        req.file && await cloudinary.uploader.destroy(public_id)  // in case of update image
            .catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })

        return next(new AppError(messages.category.failToUpdate, 500))
    }

    // send res
    res.status(200).json({
        status: 'success',
        message: messages.category.successUpdate,
        data: updatedCategory
    })

}

export const getOneCategory = async (req, res, next) => {
    const { categoryId } = req.params
    // const category = await categoryModel.findById(categoryId)
    const category = await categoryModel.aggregate([
        {
            $match: { _id: new Types.ObjectId(categoryId) }
        },
        {
            $lookup: {
                from: 'subcategories',
                localField: '_id',
                foreignField: 'category',
                as: 'subcategories'
            }
        }
    ])
    if (!category) {
        return next(new AppError(messages.category.notFound, 404))
    }
    res.status(200).json({
        status: 'success',
        message: messages.category.successFindOne,
        data: category
    })
}

export const deleteCategory = async (req, res, next) => {
    // get data from req 
    const { categoryId } = req.params

    // check existing category
    const existedCategory = await categoryModel.findById(categoryId).populate([
        { path: 'subcategories', select: 'image' },   // _id for subcategory returns by default
        { path: 'products', select: "mainImage subImages" }     // _id for product returns by default
    ])
    if (!existedCategory) {
        return next(new AppError(messages.category.notFound, 404))
    }

    // prepare ids 
    const subcategoryIds = []
    const productIds = []
    const FS_ImagePaths = []   // for file system ( category , subcategory )
    const CloudPaths = []   // for cloudinary ( products ) . both {mainImage , subImages}

    for (const subcategory of existedCategory.subcategories) {
        subcategoryIds.push(subcategory._id)
        // FS_ImagePaths.push(subcategory.image.path)  // subcategory images
        FS_ImagePaths.push(subcategory.image.public_id)  // subcategory images with cloud
    }

    for (const product of existedCategory.products) {
        productIds.push(product._id)
        CloudPaths.push(product.mainImage.public_id)  // main-image for product
        for (const subImage of product.subImages) {
            CloudPaths.push(subImage.public_id)  // sub-images for product
        }
    }

    // delete related subcategory
    await subcategoryModel.deleteMany({ _id: { $in: subcategoryIds } }).catch((err) => {
        return next(new AppError(messages.subcategory.failToDelete, 500))
    })
    // delete related products
    await productModel.deleteMany({ _id: { $in: productIds } }).catch((err) => {
        return next(new AppError(messages.product.failToDelete, 500))
    })
    // delete reviews related to products 
    await reviewModel.deleteMany({ product: { $in: productIds } }).catch((err) => {
        return next(new AppError(messages.review.failToDelete, 500))
    })
    // delete category image , subcategory image
    // FS_ImagePaths.push(existedCategory.image.path)  // category image
    FS_ImagePaths.push(existedCategory.image.public_id)  // category image with cloud
    // for (const path of FS_ImagePaths) {  // path with cloud = public_id
    //     deleteFile(path)
    // }
    await cloudinary.api.delete_resources(FS_ImagePaths).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
    // delete images for products
    if (CloudPaths.length > 0) {
        await cloudinary.api.delete_resources(CloudPaths, (error, result) => {
            if (error) {
                return next(new AppError(messages.files.failToDelete, 500))
            }
        })
    }
    // delete category
    await existedCategory.deleteOne().catch((err) => {
        return next(new AppError(messages.category.failToDelete, 500))
    })

    // send res
    res.status(200).json({
        status: 'success',
        message: messages.category.successDelete,
        // data: null
    })
}
