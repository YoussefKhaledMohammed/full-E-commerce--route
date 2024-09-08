import dotenv from 'dotenv';
import mongoose from "mongoose";
import path from 'path';

const fullPath = path.resolve("./utils/config//.env")
dotenv.config({ path: fullPath });

const dbUrl = process.env.DB_URL

const dbConnection = () => {
    return mongoose.connect(dbUrl)
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.error("Could not connect to MongoDB", err))
}

export default dbConnection