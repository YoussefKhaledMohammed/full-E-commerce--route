import { Schema, model } from "mongoose"

const couponSchema = new Schema({

    code: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
    },
    couponType: {
        type: String,
        enum: ["fixedAmount", "percentage"],
        default: "fixedAmount",
    },
    fromDate: {
        type: String,
        required: true
    },
    toDate: {
        type: String,
        required: true
    },
    assignedTo: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            maxUsers: {
                type: Number,
                // max: 100,
            },
            usedCount: {
                type: Number,
                default: 0,
            }
        }
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    }

}, { timestamps: true })

export const couponModel = model("Coupon", couponSchema)