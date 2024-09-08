import joi from "joi"
import { generalField } from "../../middlewares/validation.js"

export const addCategorySchema = joi.object({
    name: generalField.string.required(),
}).required()

export const updateCategorySchema = joi.object({
    name: generalField.string,
    categoryId: generalField.objectId.required()
}).required()

export const findOneOrDeleteCategorySchema = joi.object({
    categoryId: generalField.objectId.required()
})