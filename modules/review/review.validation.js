import joi from "joi"
import { generalField } from "../../middlewares/validation.js"


export const addReviewSchema = joi.object({
    user: generalField.objectId.required(),
    product: generalField.objectId.required(),
    comment: generalField.string.optional(),
    rate: generalField.number.max(5).min(1).required()
}).required()

export const updateReviewSchema = joi.object({
    reviewId: generalField.objectId.required(),
    comment: generalField.string.optional(),
    rate: generalField.number.max(5).min(1).optional()
}).required()

export const findAndDeleteReviewSchema = joi.object({
    reviewId: generalField.objectId.required()
})