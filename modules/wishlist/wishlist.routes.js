import { Router } from "express";
import { catchAsyncError } from "../../utils/error.js";
import { isAuthenticated } from './../../middlewares/authentication.js';
import { isAuthorized } from './../../middlewares/authorization.js';
import { isValid } from './../../middlewares/validation.js';
import { addWishlist, deleteFormWishlist, getWishlist } from "./wishlist.controllers.js";
import { WishlistSchema } from "./wishlist.validation.js";


const wishlistRouter = Router()

wishlistRouter.route('/')
    .post([
        isAuthenticated(),
        isAuthorized(["user"]),
        isValid(WishlistSchema)
    ],
        catchAsyncError(addWishlist)
    )

    .get([
        isAuthenticated(),
        isAuthorized(["user"])
    ],
        catchAsyncError(getWishlist)
    )

wishlistRouter.route('/:productId')
    .delete([
        isAuthenticated(),
        isAuthorized(["user"]),
        isValid(WishlistSchema)
    ],
        catchAsyncError(deleteFormWishlist)
    )


export default wishlistRouter