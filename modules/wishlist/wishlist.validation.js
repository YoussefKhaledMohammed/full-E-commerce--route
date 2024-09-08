import joi from "joi"
import { generalField } from "../../middlewares/validation.js"

export const WishlistSchema = joi.object({
    productId: generalField.objectId.required()
})