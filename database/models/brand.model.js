import { Schema, model } from "mongoose"

const brandSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    logo: {                      // for cloudinary  {secure_url: String, public_id: String}
        type: Object,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    }
}, { timestamps: true }, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

brandSchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "brand",
})

export const brandModel = model("Brand", brandSchema)