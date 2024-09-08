import slugify from 'slugify';
// import cloudinary from '../../utils/cloudinary.js';
// import { messages } from '../../utils/constant/messages.js';
// import { AppError } from '../../utils/error.js';
import { AppError, messages, cloudinary, ApiFeature } from '../../utils/index.js'; // inhance import
// import { brandModel } from './../../database/models/brand.model.js';
// import { categoryModel } from './../../database/models/category.model.js';
// import { productModel } from './../../database/models/product.model.js';
// import { subcategoryModel } from './../../database/models/subcategory.model.js';
import { categoryModel, productModel, subcategoryModel, brandModel, reviewModel } from '../../database/index.js'; // inhance import

export const addProduct = async (req, res, next) => {
    // get data from req
    let { name, description, price, discount, stock, colors, sizes, rate, category, subcategory, brand } = req.body
    name = name.trim().toLowerCase()
    description = description.trim()
    // req.files

    // check if image is uploaded
    if (!req.files) {
        return next(new AppError(messages.files.required, 400))
    }

    // check existence & no check existence for name because it isn't unique

    // 1-check existing brand
    const existedBrand = await brandModel.findById(brand)
    if (!existedBrand) {
        return next(new AppError(messages.brand.notFound, 404))
    }

    // 2-check existing subcategory
    const existedSubcategory = await subcategoryModel.findById(subcategory)
    if (!existedSubcategory) {
        return next(new AppError(messages.subcategory.notFound, 404))
    }

    // 3-check existing category
    const existedCategory = await categoryModel.findById(category)
    if (!existedCategory) {
        return next(new AppError(messages.category.notFound, 404))
    }
    // upload images to cloudinary
    // 1-main image
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: "e-commerce/products/mainImages" })
    if (!secure_url || !public_id) {
        return next(new AppError(messages.files.failToUpload, 500))
    }
    // 2-sub images
    const subImagesArray = []
    for (const file of req.files.subImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: "e-commerce/products/subImages" })
        if (!secure_url || !public_id) {
            //  delete mainImage from cloudinary
            // await cloudinary.uploader.destroy(public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
            return next(new AppError(messages.files.failToUpload, 500))
        }
        subImagesArray.push({ secure_url, public_id })
    }

    // prepare data
    const slug = slugify(name)

    const product = new productModel({
        name, slug, description,
        price,
        discount: discount || 0, stock: stock || 1,
        rate: rate || 0,
        colors: JSON.parse(colors), sizes: JSON.parse(sizes),
        category, subcategory, brand,
        mainImage: { secure_url: secure_url, public_id: public_id },
        subImages: subImagesArray,
        createdBy: req.authUser._id
    })

    // add to database
    const createdProduct = await product.save()
    if (!createdProduct) {
        //  rollback delete images form cloudinary
        // await cloudinary.uploader.destroy(public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
        // for (const image of subImagesArray) {
        //     await cloudinary.uploader.destroy(image.public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
        // }
        return next(new AppError(messages.product.failToCreate, 500))
    }

    // send res
    res.status(201).json({
        status: 'success',
        message: messages.product.successCreate,
        data: createdProduct
    })

}

export const getProducts = async (req, res, next) => {

    const apiFeature = new ApiFeature(productModel.find().lean(), req.query)
        .pagination().sort().select().filter()

    const products = await apiFeature.mongooseQuery

    if (!products) {
        next(new AppError(messages.product.failToGetAll, 500))
    }
    res.status(200).json({
        status: 'success',
        message: messages.product.successFindAll,
        data: products,
        // metaData: { page, size, nextPage: page + 1 }
    })
    // ////////////////////////////////////////////////////////////////////////////////////////////////////
    // let { page, size, sort, select, ...filter } = req.query
    ////////// pagination
    // if (!page | page <= 0) {
    //     page = 1
    // }
    // page && (page = parseInt(page));
    // if (!size | size <= 0) {
    //     size = 3
    // }
    // size && (size = parseInt(size));
    // const skip = (page - 1) * size
    //////////pagination
    //////////sort
    // sort && (sort = sort.replaceAll(",", ' '))
    // // console.log(sort);
    //////////sort
    //////////select
    // select && (select = select.replaceAll(",", ' '))
    // // console.log(select);
    //////////select
    //////////filter
    //  filter = JSON.parse(JSON.stringify(filter).replace(/gt|gte|lt|lte/g, (match) => `$${match}`))  // g to apply regex for all (global0) 
    //  // console.log(filter);
    //////////filter

    // const mongooseQuery = productModel.find(filter)
    // mongooseQuery.limit(size).skip(skip).sort(sort).select(select).lean()   // lean()  does not include virtuals or getters in the returned objects
    // const products = await mongooseQuery
    // if (!products) {
    //     next(new AppError(messages.product.failToGetAll, 500))
    // }
    // res.status(200).json({
    //     status: 'success',
    //     message: messages.product.successFindAll,
    //     data: products,
    //     metaData: { page, size, nextPage: page + 1 }
    // })


}

export const updateProduct = async (req, res, next) => {
    // get data from req
    let { name, description, price, discount, stock, colors, sizes, rate, category, subcategory, brand } = req.body
    const { productId } = req.params

    name && name.trim().toLowerCase()

    // check existing category
    if (category) {
        const existedCategory = await categoryModel.findById(category)
        if (!existedCategory) {
            return next(new AppError(messages.category.notFound, 404))
        }
    }

    // check existing subcategory
    if (subcategory) {
        const existedSubcategory = await subcategoryModel.findById(subcategory)
        if (!existedSubcategory) {
            return next(new AppError(messages.subcategory.notFound, 404))
        }
    }

    // check existing brand
    if (brand) {
        const existedBrand = await brandModel.findById(brandId)
        if (!existedBrand) {
            return next(new AppError(messages.brand.notFound, 404))
        }
    }

    // check existing product
    const existedProduct = await productModel
        .findById(productId)
    // .populate('category')
    // .populate('subcategory')
    // .populate('brand')
    if (!existedProduct) {
        return next(new AppError(messages.product.notFound, 404))
    }

    // upload images to cloudinary
    // 1-main image
    if (req.files.mainImage) {
        await cloudinary.uploader.destroy(existedProduct.mainImage.public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: "e-commerce/products/mainImages" })
        if (!secure_url || !public_id) {
            return next(new AppError(messages.file.failToUpload, 500))
        }
        existedProduct.mainImage = { secure_url: secure_url, public_id: public_id }
    }

    // 2-sub images
    if (req.files.subImages) {
        // delete old images from cloudinary
        const publicIdsForSubImages = existedProduct.subImages.map((image) => image.public_id)
        // for (const image of existedProduct.subImages) {
        // await cloudinary.uploader.destroy(image.public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
        // }
        await cloudinary.api.delete_resources(publicIdsForSubImages, (err, result) => {
            if (err) {
                return next(new AppError(messages.files.failToDelete, 500))
            }
        })
        // upload new images
        const subImagesArray = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: "e-commerce/products/subImages" })
            if (!secure_url || !public_id) {
                // delete mainImage from cloudinary
                await cloudinary.uploader.destroy(existedProduct.mainImage.public_id).catch((err) => { next(new AppError(messages.file.failToDelete, 500)) })
                return next(new AppError(messages.files.failToUpload, 500))
            }
            subImagesArray.push({ secure_url, public_id })
        }
        existedProduct.subImages = subImagesArray
    }

    // update data
    name && (existedProduct.name = name)
    existedProduct.slug = slugify(name)
    description && (existedProduct.description = description)
    price && (existedProduct.price = price)
    discount && (existedProduct.discount = discount)
    stock && (existedProduct.stock = stock)
    colors && (existedProduct.colors = JSON.parse(colors))
    sizes && (existedProduct.sizes = JSON.parse(sizes))
    rate && (existedProduct.rate = rate)
    category && (existedProduct.category = category)
    subcategory && (existedProduct.subcategory = subcategory)
    brand && (existedProduct.brand = brand)
    existedProduct.updatedBy = req.authUser._id

    // save to database
    const updatedProduct = await existedProduct.save()
    if (!updatedProduct) {
        return next(new AppError(messages.product.failToUpdate, 500))
    }

    // send res
    res.status(200).json({
        status: 'success',
        message: messages.product.successUpdate,
        data: updatedProduct
    })

}

export const getOneProduct = async (req, res, next) => {
    const { productId } = req.params
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new AppError(messages.product.notFound, 404))
    }
    res.status(200).json({
        status: 'success',
        message: messages.product.successFindOne,
        data: product
    })
}

export const deleteProduct = async (req, res, next) => {
    // get data from req 
    const { productId } = req.params

    // check existing subcategory
    const existedProduct = await productModel.findById(productId)
    if (!existedProduct) {
        return next(new AppError(messages.product.notFound, 404))
    }

    // delete images from cloudinary
    const CloudPaths = [existedProduct.mainImage.public_id]  // product main-image

    for (const image of existedProduct.subImages) {
        CloudPaths.push(image.public_id)  // product sub-images
    }

    await cloudinary.api.delete_resources(CloudPaths, (error, result) => {
        if (error) {
            return next(new AppError(messages.files.failToDelete, 500))
        }
    })
    // delete product
    await existedProduct.deleteOne().catch((err) => {
        return next(new AppError(messages.product.failToDelete, 500))
    })

    // delete reviews related to product
    await reviewModel.deleteMany({ product: productId }).catch((err) => {
        return next(new AppError(messages.review.failToDelete, 500))
    })

    // send res
    res.status(200).json({
        status: 'success',
        message: messages.product.successDelete,
        // data: null
    })
}