const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        discountPercent: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        categories: {
            type: [String],
            required: true,
            enum: ["All", "Nam", "Nữ", "Top Wear", "Bottom Wear"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);