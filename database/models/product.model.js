import { Schema, model } from "mongoose"

const productSchema = new Schema({
    // names /////////////////
    name: {
        type: String,
        unique: false,
        required: true,
        lowercase: true,
        trim: true,
    },
    slug: {
        type: String,
        false: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    // prices /////////////////
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
    },
    // properties /////////////////
    stock: {
        type: Number,
        default: 1,
        min: 0,
    },
    colors: [
        {
            type: String,
        }
    ],
    sizes: [
        {
            type: String,
        }
    ],
    rate: {
        type: Number,
        required: false,
        min: 0,
        max: 5,
        default: 0,
    },
    // images /////////////////
    mainImage: {                      // for cloudinary  {secure_url: String, public_id: String}
        type: Object,
        required: true
    },
    subImages: [{                     // for cloudinary  {secure_url: String, public_id: String}
        type: Object,
        required: true
    }],
    // related ids /////////////////
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: "Subcategory",
        required: true,
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
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
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

// virtuals
productSchema.virtual("finalPrice").get(function () {
    // formula: price - (price * discount / 100)
    return this.price - (this.price * ((this.discount || 0) / 100))
})

// do a method for productSchema
productSchema.methods.inStock = function (quantity) {
    return this.stock < quantity ? false : true
}


export const productModel = model("Product", productSchema)