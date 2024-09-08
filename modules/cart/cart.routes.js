import { Router } from "express";
import { catchAsyncError } from '../../utils/index.js';
import { isAuthenticated } from './../../middlewares/authentication.js';
import { isAuthorized } from './../../middlewares/authorization.js';
import { isValid } from './../../middlewares/validation.js';
import { addToCart } from "./cart.controllers.js";
import { addProductToCartSchema } from './cart.validation.js';

const cartRouter = Router()

cartRouter.route("/")
    .post([
        isAuthenticated(),
        isAuthorized(["user"]),
        isValid(addProductToCartSchema)
    ],
        catchAsyncError(addToCart)
    )

export default cartRouter