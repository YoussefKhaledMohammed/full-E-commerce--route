import { Router } from "express";
import { catchAsyncError } from "../../utils/error.js";
import { isAuthenticated } from './../../middlewares/authentication.js';
import { isAuthorized } from './../../middlewares/authorization.js';
import { isValid } from './../../middlewares/validation.js';
import { createOrder } from "./order.controllers.js";
import { addOrderSchema } from "./order.validation.js";

const orderRouter = Router()

orderRouter.route("/")
    .post([
        isAuthenticated(),
        isAuthorized(["user"]),
        isValid(addOrderSchema)
    ],
        catchAsyncError(createOrder)
    )


export default orderRouter 