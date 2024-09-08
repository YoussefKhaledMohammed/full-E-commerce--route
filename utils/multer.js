import fs from "fs";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import { AppError } from "./error.js";

const fileUpload = (folder) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const fullPath = path.resolve(`uploads/${folder}`);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
            cb(null, `uploads/${folder}`);
        },
        filename: function (req, file, cb) {
            cb(null, nanoid() + "_" + file.originalname);
        },
    });

    function fileFilter(req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            // To accept the file pass `true`, like so:
            cb(null, true)
        }
        else {
            // To reject this file pass `false`, like so:
            cb(null, false)
            // You can always pass an error if something goes wrong:
            cb(new AppError('Accepts Images Only'))
        }
    }

    return multer({ storage: storage, fileFilter: fileFilter });
};

export default fileUpload;