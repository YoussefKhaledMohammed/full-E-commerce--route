import { Schema, model } from "mongoose"

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            name: String,
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: Number
            },
            finalPrice: {
                type: Number
            },
            discount: {
                type: Number
            },
        }
    ],
    address: {
        phone: String,
        street: String
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "visa"],
        default: "cash"
    },
    status: {
        type: String,
        enum: ["placed", "delivered", "canceled", "refunded"],
        default: "placed"
    },
    coupon: {
        couponId: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
        },
        code: String,
        discount: Number
    },
    orderPrice: Number,
    finalPrice: Number,

}, { timestamps: true })

export const orderModel = model("Order", orderSchema)