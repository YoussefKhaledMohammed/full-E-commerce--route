import joi from "joi"
import { generalField } from "../../middlewares/validation.js"

export const addBrandSchema = joi.object({
    name: generalField.string.required(),
}).required()

export const updateBrandSchema = joi.object({
    name: generalField.string,
    brandId: generalField.objectId.required()
}).required()

export const findOneAndDeleteBrandSchema = joi.object({
    brandId: generalField.objectId.required()
})