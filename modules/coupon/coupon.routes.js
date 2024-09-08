import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authentication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { isValid } from "../../middlewares/validation.js";
import { catchAsyncError } from "../../utils/index.js";
import { addCoupon } from "./coupon.controllers.js";
import { addCouponSchema } from './coupon.validation.js';

const couponRouter = Router()

couponRouter.route("/")
    .post(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            isValid(addCouponSchema)
        ],
        catchAsyncError(addCoupon)
    )

export default couponRouter 