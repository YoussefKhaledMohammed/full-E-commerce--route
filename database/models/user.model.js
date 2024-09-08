import { Schema, model } from "mongoose"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    status: {
        type: String,
        enum: ["pending", "verified", "blocked"],
        default: "pending"
    },
    active: {
        type: Boolean,
        default: false
    },
    DOP: {
        type: String,
        // type: Date,
    },
    image: {
        secure_url: { type: String, default: 'https://res.cloudinary.com/dcy8i3gle/image/upload/v1723730973/download_zzkcc5.jpg' },
        public_id: { type: String, default: 'download_zzkcc5' }
    },
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ]

}, { timestamps: true })



export const userModel = model("User", userSchema)