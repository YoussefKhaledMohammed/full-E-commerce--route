import joi from "joi";
import { AppError } from "../utils/error.js";

export const generalField = {
    string: joi.string(),
    number: joi.number(),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    date: joi.date(),
    objectId: joi.string().hex().length(24)
}

export const isValid = (schema = {}) => {
    return (req, res, next) => {
        let data = { ...req.params, ...req.query, ...req.body }
        const { error } = schema.validate(data, { abortEarly: false })
        if (error) {
            return next(new AppError(error.details.map((err) => next(new AppError(err.message, 400)))))
        }
        next()
    }
}