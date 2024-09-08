import multer from "multer";
import { AppError } from "./error.js";

const cloudinaryUpload = (folder) => {
    const storage = multer.diskStorage({});

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

export default cloudinaryUpload;