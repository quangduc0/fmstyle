const mongoose = require("mongoose");

const checkoutItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        size: String,
        color: String,
    },
    { _id: false }
);

const checkoutSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        checkoutItems: [checkoutItemSchema],
        shippingAddress: {
            firstName: {
                type: String,
                required: true
            },
            lastName: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            postalCode: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            },
            phone: {
                type: Number,
                required: true
            }
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "unpaid", "failed"],
            default: "pending",
        },
        paymentDetails: {
            // Lưu trữ chi tiết liên quan đến thanh toán (ID giao dịch, phản hồi paypal)
            type: mongoose.Schema.Types.Mixed,
        },
        isFinalized: {
            type: Boolean,
            default: false,
        },
        finalizedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Checkout", checkoutSchema);