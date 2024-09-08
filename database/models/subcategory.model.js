import { Schema, model } from "mongoose"

const subcategorySchema = new Schema({
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
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
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
    },
}, { timestamps: true }, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

subcategorySchema.post("aggregate", function (docs) {
    docs.forEach((doc) => {
        doc.image = "http://localhost:3000/" + doc.image.path;
    });
})

subcategorySchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "subcategory",
})

export const subcategoryModel = model("Subcategory", subcategorySchema)