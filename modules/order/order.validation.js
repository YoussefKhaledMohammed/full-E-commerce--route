import joi from "joi"
import { generalField } from "../../middlewares/validation.js"


export const addOrderSchema = joi.object({
    phone: generalField.string.required(),
    street: generalField.string.required(),
    paymentMethod: generalField.string.valid(...["cash", "visa"]),
    code: generalField.string,
    // couponId: generalField.objectId
}).required()