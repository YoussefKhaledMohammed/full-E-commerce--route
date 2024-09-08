import joi from "joi"
import { generalField } from "../../middlewares/validation.js"

const pattern = /^01[0125][0-9]{8}$/

export const signupValidation = joi.object({
    username: generalField.string.required(),
    email: generalField.email.required(),
    password: generalField.string.required(),
    phone: generalField.string.required().regex(pattern),
    // role: generalField.string.valid('user', 'admin').optional(),
    // status: generalField.string.valid('pending', 'verified', 'blocked').optional(),
    // active: generalField.boolean.optional(),
    DOP: generalField.string.required(),    // DOP: generalField.date.required(),
    // image: joi.object().optional()
}).required()

export const signInValidation = joi.object({
    email: generalField.email.when('phone', {
        is: joi.exist(),
        then: joi.optional(),
        otherwise: joi.required()
    }),
    phone: generalField.string,
    password: generalField.string,
}).required()