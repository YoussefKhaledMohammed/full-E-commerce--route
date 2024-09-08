import { Router } from "express";
import { isAuthenticated } from "../../middlewares/authentication.js";
import { isAuthorized } from './../../middlewares/authorization.js';
import { isValid } from "../../middlewares/validation.js";
import { catchAsyncError } from "../../utils/index.js";
import { addReview, deleteReview, getAllReviewForProduct, getReview, updateReview } from "./review.controllers.js";
import { addReviewSchema, findAndDeleteReviewSchema, updateReviewSchema } from "./review.validation.js";


const reviewRouter = Router()

reviewRouter.route("/")
    .post([isValid(addReviewSchema), isAuthenticated(), isAuthorized(["user", "admin"])], catchAsyncError(addReview))
    .get(catchAsyncError(getAllReviewForProduct))
reviewRouter.route("/:reviewId")
    .get([isValid(findAndDeleteReviewSchema), isAuthenticated()], catchAsyncError(getReview))
    .put([isValid(updateReviewSchema), isAuthenticated(), isAuthorized(["user", "admin"])], catchAsyncError(updateReview))
    .delete([isValid(findAndDeleteReviewSchema), isAuthenticated(), isAuthorized(["user", "admin"])], catchAsyncError(deleteReview))

export default reviewRouter 