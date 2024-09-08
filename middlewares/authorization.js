import { AppError, messages } from "../utils/index.js";

export const isAuthorized = (roles) =>
    (req, res, next) => {
        if (!roles.includes(req.authUser.role)) {
            return next(new AppError(messages.user.notAllowed, 401))
        }
        next()
    }