import slugify from 'slugify';
// import cloudinary from '../../utils/cloudinary.js';
// import { messages } from '../../utils/constant/messages.js';
// import { AppError } from '../../utils/error.js';
import { AppError, messages, cloudinary, ApiFeature } from '../../utils/index.js'; // inhance import
// import { brandModel } from './../../database/models/brand.model.js';
// import { productModel } from './../../database/models/product.model.js';
import { brandModel, productModel, reviewModel } from '../../database/index.js'; // inhance import


export const addBrand = async (req, res, next) => {
    // get data from req
    let { name } = req.body
    name = name.trim().toLowerCase()
    // req.file

    // check if image is uploaded
    if (!req.file) {
        return next(new AppError(messages.file.required, 400))
    }
    // check existing brand
    const existedBrand = await brandModel.findOne({ name: name })
    if (existedBrand) {
        return next(new AppError(messages.brand.alreadyExist, 409))
    }

    // prepare data
    const slug = slugify(name)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: "e-commerce/brands" })
    if (!secure_url || !public_id) {
        return next(new AppError(messages.file.failToUpload, 500))
    }

    const brand = new brandModel({
        name,
        slug,
        logo: { secure_url: secure_url, public_id: public_id },
        createdBy: req.authUser._id,
    })

    // add to database
    const createdBrand = await brand.save()
    if (!createdBrand) {
        // rollback delete image form cloudinary
        await cloudinary.uploader.destroy(public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
        return next(new AppError(messages.brand.failToCreate, 500))
    }

    // send res
    res.status(201).json({
        status: 'success',
        message: messages.brand.successCreate,
        data: createdBrand
    })

}

export const getBrands = async (req, res, next) => {

    const apiFeature = new ApiFeature(brandModel.find(), req.query)
        .pagination()

    const brands = await apiFeature.mongooseQuery

    if (!brands) {
        next(new AppError(messages.brand.failToGetAll, 500))
    }
    res.status(200).json({
        status: 'success',
        message: messages.brand.successFindAll,
        data: brands,
        // metaData: { page, size, nextPage: page + 1 }
    })
    // /////////////////////////////////
    // await categoryModel.find()
    // await brandModel.find()
    //     .then((brands) => {
    //         res.status(200).json({
    //             status: 'success',
    //             message: messages.brand.successFindAll,
    //             data: brands
    //         })
    //     })
    //     .catch((err) => {
    //         next(new AppError(messages.brand.failToGetAll, 500))
    //     })
}

export const updateBrand = async (req, res, next) => {
    // get data from req
    let { name } = req.body
    const { brandId } = req.params

    name && name.trim().toLowerCase()

    // check brand exist
    const existedBrand = await brandModel.findById(brandId)
    if (!existedBrand) {
        return next(new AppError(messages.brand.notFound, 404))
    }

    // check name exist
    const isNameExist = await brandModel.findOne({ name: name, _id: { $ne: brandId } })
    if (isNameExist) {
        return next(new AppError(messages.brand.alreadyExist, 409))
    }

    // update data
    if (req.file) {
        // delete old image from cloudinary
        await cloudinary.uploader.destroy(existedBrand.logo.public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: "e-commerce/brands" })
        if (!secure_url || !public_id) {
            return next(new AppError(messages.file.failToUpload, 500))
        }
        existedBrand.logo = { secure_url: secure_url, public_id: public_id }
    }

    if (name) {
        existedBrand.name = name
        existedBrand.slug = slugify(name)
    }

    existedBrand.updatedBy = req.authUser._id

    // update db
    const updatedBrand = await existedBrand.save()
    if (!updatedBrand) {
        req.file && await cloudinary.uploader.destroy(public_id)  // in case of update image
            .catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })

        return next(new AppError(messages.brand.failToUpdate, 500))
    }

    // send res
    res.status(200).json({
        status: 'success',
        message: messages.brand.successUpdate,
        data: updatedBrand
    })

}

export const getOneBrand = async (req, res, next) => {
    const { brandId } = req.params
    const brand = await brandModel.findById(brandId)
    if (!brand) {
        return next(new AppError(messages.brand.notFound, 404))
    }
    res.status(200).json({
        status: 'success',
        message: messages.brand.successFindOne,
        data: brand
    })
}

export const deleteBrand = async (req, res, next) => {
    // get data from req 
    const { brandId } = req.params

    // check existing subcategory
    const existedBrand = await brandModel.findById(brandId).populate([
        { path: 'products', select: "mainImage subImages" }     // _id for product returns by default
    ])
    if (!existedBrand) {
        return next(new AppError(messages.brand.notFound, 404))
    }

    // prepare ids 
    const productIds = []
    const CloudPaths = []   // for cloudinary ( products ) . both {mainImage , subImages}
    // const FS_ImagePaths = []   // for file system ( subcategory )

    for (const product of existedBrand.products) {
        productIds.push(product._id)
        CloudPaths.push(product.mainImage.public_id)  // main-image for product
        for (const subImage of product.subImages) {
            CloudPaths.push(subImage.public_id)  // sub-images for product
        }
    }

    // delete related products
    await productModel.deleteMany({ _id: { $in: productIds } }).catch((err) => {
        return next(new AppError(messages.product.failToDelete, 500))
    })
    // delete reviews related to products
    await reviewModel.deleteMany({ product: { $in: productIds } }).catch((err) => {
        return next(new AppError(messages.review.failToDelete, 500))
    })

    // delete brand image
    await cloudinary.uploader.destroy(existedBrand.logo.public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
    // delete images for products
    await cloudinary.api.delete_resources(CloudPaths, (error, result) => {
        if (error) {
            return next(new AppError(messages.files.failToDelete, 500))
        }
    })
    // delete brand
    await existedBrand.deleteOne().catch((err) => {
        return next(new AppError(messages.brand.failToDelete, 500))
    })

    // send res
    res.status(200).json({
        status: 'success',
        message: messages.brand.successDelete,
        // data: null
    })
}