import { Router } from "express";
import { isValid } from "../../middlewares/validation.js";
import { isAuthenticated } from './../../middlewares/authentication.js';
import { isAuthorized } from './../../middlewares/authorization.js';
// import { catchAsyncError } from "../../utils/error.js";
// import fileUpload from "../../utils/multer.js";
import { catchAsyncError, cloudinaryUpload, fileUpload } from '../../utils/index.js'; // inhance import
import { addCategory, deleteCategory, getCategories, getOneCategory, updateCategory } from "./category.controllers.js";
import { addCategorySchema, findOneOrDeleteCategorySchema, updateCategorySchema } from './category.validation.js';

const
    categoryRouter = Router()

categoryRouter.route('/')
    .post(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            // fileUpload("category").single("image"),
            cloudinaryUpload("category").single("image"),
            isValid(addCategorySchema)
        ],
        catchAsyncError(addCategory))  // to do authentication & authorization
    .get(catchAsyncError(getCategories))

categoryRouter.route('/:categoryId')
    .put(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            // fileUpload("category").single("image"),
            cloudinaryUpload("category").single("image"),
            isValid(updateCategorySchema)
        ],
        catchAsyncError(updateCategory))
    .get(isValid(findOneOrDeleteCategorySchema), catchAsyncError(getOneCategory))
    .delete(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            isValid(findOneOrDeleteCategorySchema)
        ],
        catchAsyncError(deleteCategory))


export default categoryRouter
