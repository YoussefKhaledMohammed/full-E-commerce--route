import dotenv from "dotenv";
import path from 'path';
import { AppError, messages, verifyToken } from "../utils/index.js";
import { userModel } from './../database/models/user.model.js';

const fullPath = path.resolve("../utils/config/.env")
dotenv.config({ path: fullPath })

export const isAuthenticated = () =>
    async (req, res, next) => {
        const { authentication } = req.headers
        if (!authentication) {
            return next(new AppError("Authentication failed", 401))
        }

        const [bearer, token] = authentication.split(" ") // ["bearer", "token"]
        let result = ''
        // console.log(bearer);
        if (bearer == 'assess-token') {
            result = verifyToken({ token, secretKey: process.env.ACCESS_TOKEN_SECRET })
        }
        if (bearer == 'reset-password') {
            result = verifyToken({ token, secretKey: process.env.RESET_PASSWORD_SECRET })
        }
        if (bearer == 'confirm-email') {
            result = verifyToken({ token, secretKey: process.env.CONFIRM_EMAIL_SECRET })
        }

        if (result.error) {
            return next(new AppError({ message: result.error, status: 401 }))
        }
        // check user existence
        const user = await userModel.findOne({ email: result.email, status: 'verified' }).select('-password')
        if (!user) {
            return next(new AppError(messages.user.notFound, 404))
        }

        req.authUser = result
        next()
    }
