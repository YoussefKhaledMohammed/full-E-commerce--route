import { deleteFile } from './deleteFile.js';

export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const catchAsyncError = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => {
            next(err)
        })
    }
}

export const globalError = (err, req, res, next) => {
    if (req.file) {
        deleteFile(req.file.path)
    }
    let code = err.statusCode || 500
    res.status(code).json({ message: "Error", code, err: err.message })
}