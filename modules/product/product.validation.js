import joi from "joi"
import { generalField } from "../../middlewares/validation.js"

const parseArray = (value, helper) => {
    let parsedValue = JSON.parse(value)
    let schema = joi.array().items(joi.string())
    const { error } = schema.validate(parsedValue, { abortEarly: false })
    if (error) {
        helper("invalid data")
    } else {
        return true
    }
}

export const addProductSchema = joi.object({
    name: generalField.string.required(),
    description: generalField.string.required(),
    price: generalField.number.min(0).required(),
    discount: generalField.number.min(0).max(100),
    stock: generalField.number.min(0),
    // do a validation for colors , colors value is ["red" , "green"]
    colors: joi.custom(parseArray),
    sizes: joi.custom(parseArray),
    // sizes: joi.array().items(generalField.string),
    rate: generalField.number.min(0).max(5),
    category: generalField.objectId.required(),
    subcategory: generalField.objectId.required(),
    brand: generalField.objectId.required(),
}).required()

export const updateProductSchema = joi.object({
    name: generalField.string,
    description: generalField.string,
    price: generalField.number.min(0),
    discount: generalField.number.min(0).max(100),
    stock: generalField.number.min(0),
    colors: joi.custom(parseArray),
    sizes: joi.custom(parseArray),
    rate: generalField.number.min(0).max(5),
    productId: generalField.objectId.required(),
    category: generalField.objectId,
    subcategory: generalField.objectId,
    brand: generalField.objectId,
}).required()

export const findOneAndDeleteProductSchema = joi.object({
    productId: generalField.objectId.required()
})