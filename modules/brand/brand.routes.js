import { Router } from "express";
import { isValid } from "../../middlewares/validation.js";
import { isAuthenticated } from './../../middlewares/authentication.js';
// import { catchAsyncError } from "../../utils/error.js";
// import cloudinaryUpload from "../../utils/multer-cloud.js";
import { isAuthorized } from '../../middlewares/authorization.js';
import { catchAsyncError, cloudinaryUpload } from '../../utils/index.js'; // inhance import
import { addBrand, deleteBrand, getBrands, getOneBrand, updateBrand } from "./brand.controllers.js";
import { addBrandSchema, findOneAndDeleteBrandSchema, updateBrandSchema } from "./brand.validation.js";

const brandRouter = Router()

brandRouter.route('/')
    .post(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            cloudinaryUpload("brand").single("logo"),
            isValid(addBrandSchema)
        ],
        catchAsyncError(addBrand))  // to do authentication & authorization
    .get(catchAsyncError(getBrands))

brandRouter.route('/:brandId')
    .put(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            cloudinaryUpload("brand").single("logo"),
            isValid(updateBrandSchema)
        ],
        catchAsyncError(updateBrand))
    .get(isValid(findOneAndDeleteBrandSchema), catchAsyncError(getOneBrand))
    .delete(
        [
            isAuthenticated(),
            isAuthorized(["admin"]),
            isValid(findOneAndDeleteBrandSchema)
        ],
        deleteBrand)
export default brandRouter