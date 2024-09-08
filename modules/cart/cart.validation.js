import joi from "joi"
import { generalField } from "../../middlewares/validation.js"

export const addProductToCartSchema = joi.object({
    productId: generalField.string.required(),
    quantity: generalField.number.required()

}).required()
