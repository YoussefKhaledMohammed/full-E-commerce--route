import { couponModel } from "../../database/index.js"
import { AppError, messages } from "../../utils/index.js"

export const addCoupon = async (req, res, next) => {
    // get data from req 
    const { code, discount, couponType, fromDate, toDate, assignedTo } = req.body

    // check coupon existence
    const couponExist = await couponModel.findOne({ code: code })
    if (couponExist) {
        return next(new AppError(messages.coupon.alreadyExist, 409))
    }

    // check amount 
    if (couponType == "percentage" && discount > 100) {
        return next(new AppError("discount must be less or equal to 100%", 400))
    }

    // create coupon
    const createdCoupon = await couponModel.create({
        code,
        discount,
        couponType,
        fromDate,
        toDate,
        assignedTo,
        createdBy: req.authUser._id
    })


    // send res
    return res.status(201).json({ message: messages.coupon.successCreate, data: createdCoupon })
}