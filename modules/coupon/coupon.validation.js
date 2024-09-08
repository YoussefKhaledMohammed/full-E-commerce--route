import joi from "joi"
import { generalField } from "../../middlewares/validation.js"


export const addCouponSchema = joi.object({
    code: generalField.string.required(),
    discount: generalField.number.positive().optional(),
    couponType: generalField.string.valid(...["fixedAmount", "percentage"]).optional(),
    fromDate: generalField.date.greater(Date.now() - (24 * 60 * 60 * 1000)).required(),
    toDate: generalField.date.greater(joi.ref("fromDate")).required(),
    assignedTo: joi.array().items(joi.object({}).keys({
        userId: generalField.objectId.required(),
        maxUsers: generalField.number.optional(),
        usedCount: generalField.number.optional()
    })).optional(),
}).required()