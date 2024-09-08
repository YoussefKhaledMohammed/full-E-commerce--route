import { Schema, model } from "mongoose"

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    comment: {
        type: String,
    },
    rate: {
        type: Number,
        max: 5,
        min: 0,
    }
}, { timestamps: true })



export const reviewModel = model("Review", reviewSchema)