import { Router } from "express";
import { isValid } from "../../middlewares/validation.js";
// import { catchAsyncError } from "../../utils/error.js";
// import fileUpload from "../../utils/multer.js";
import { isAuthenticated } from "../../middlewares/authentication.js";
import { isAuthorized } from "../../middlewares/authorization.js";
import { catchAsyncError, cloudinaryUpload, fileUpload } from '../../utils/index.js'; // inhance import
import { addSubcategory, deleteSubcategory, getOneSubcategory, getSubcategories, updateSubcategory } from "./subcategory.controllers.js";
import { addSubCategorySchema, findOneAndDeleteSubcategorySchema, updateSubcategorySchema } from './subcategory.validation.js';

const subcategoryRouter = Router()

subcategoryRouter.route('/')
    .post(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            // fileUpload("subcategory").single("image"),
            cloudinaryUpload("subcategory").single("image"),
            isValid(addSubCategorySchema)
        ],
        catchAsyncError(addSubcategory))  // to do authentication & authorization
    .get(catchAsyncError(getSubcategories))

subcategoryRouter.route('/:subcategoryId')
    .put(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            // fileUpload("subcategory").single("image"),
            cloudinaryUpload("subcategory").single("image"),
            isValid(updateSubcategorySchema)
        ],
        catchAsyncError(updateSubcategory))
    .get(isValid(findOneAndDeleteSubcategorySchema), catchAsyncError(getOneSubcategory))
    .delete(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            isValid(findOneAndDeleteSubcategorySchema)
        ],
        catchAsyncError(deleteSubcategory))

export default subcategoryRouter
