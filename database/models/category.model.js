import { Schema, model } from "mongoose"

const categorySchema = new Schema({
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
    image: {
        type: Object,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

categorySchema.post("aggregate", function (docs) {
    docs.forEach((doc) => {
        doc.image = "http://localhost:3000/" + doc.image.path;
    });
})

categorySchema.virtual("subcategories", {
    ref: "Subcategory",
    localField: "_id",
    foreignField: "category",
})

categorySchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "category",
})

export const categoryModel = model("Category", categorySchema)