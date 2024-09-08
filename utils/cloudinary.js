import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';


const fullPath = path.resolve("./utils/config/.env")
dotenv.config({ path: fullPath });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

export default cloudinary;