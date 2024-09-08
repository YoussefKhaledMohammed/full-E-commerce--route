import joi from "joi"
import { generalField } from "../../middlewares/validation.js"

export const addSubCategorySchema = joi.object({
    name: generalField.string.required(),
    category: generalField.objectId.required(),
}).required()

export const updateSubcategorySchema = joi.object({
    name: generalField.string,
    category: generalField.objectId,
    subcategoryId: generalField.objectId.required()
}).required()

export const findOneAndDeleteSubcategorySchema = joi.object({
    subcategoryId: generalField.objectId.required()
})