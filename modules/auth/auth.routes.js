import { Router } from "express";
import { isValid } from "../../middlewares/validation.js";
import { catchAsyncError } from "../../utils/error.js";
import cloudinaryUpload from "../../utils/multer-cloud.js";
import { isAuthenticated } from './../../middlewares/authentication.js';
import { changeImage, signIn, signup, verifyAccount } from "./auth.controllers.js";
import { signInValidation, signupValidation } from "./auth.validation.js";


const authRouter = Router()

authRouter.route('/signup')
    .post(isValid(signupValidation), catchAsyncError(signup))
authRouter.route('/signIn')
    .post(isValid(signInValidation), catchAsyncError(signIn))
// verify account
authRouter.route('/verify/')
    .get(catchAsyncError(verifyAccount))

authRouter.route('/changeImage')
    .post(
        [
            isAuthenticated(),
            cloudinaryUpload("users").single("avatar")
        ],
        catchAsyncError(changeImage))

export default authRouter 