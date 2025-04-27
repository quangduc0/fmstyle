const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/checkout (Tạo phiên thanh toán mới)
router.post("/", protect, async (req, res) => {
    const {
        checkoutItems, 
        shippingAddress, 
        paymentMethod,
        totalPrice
    } = req.body;

    if (!checkoutItems || checkoutItems.length ===0) {
        return res.status(400).json({message: "Không có đơn hàng để thanh toán"});
    }

    try {
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems: checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: "Pending",
            isPaid: false,
        });
        console.log(`Thanh toán tạo cho người dùng: ${req.user._id}`);
        res.status(201).json(newCheckout);
    } catch (error) {
        console.error("Lỗi khi tạo phiên thanh toán:", error);
        res.status(500).json({message: "Lỗi máy chủ"});
    }
});

// PUT /api/checkout/:id/pay (Cập nhật đánh dấu là đã thanh toán sau khi thanh toán thành công)
router.put("/:id/pay", protect, async (req, res) => {
    const {paymentStatus, paymentDetails} = req.body;

    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({message: "Không tìm thấy thanh toán"});
        }

        if (paymentStatus === "paid") {
            checkout.isPaid = true;
            checkout.paymentStatus = paymentStatus;
            checkout.paymentDetails = paymentDetails;
            checkout.paidAt = Date.now();
            await checkout.save();

            res.status(200).json(checkout);
        } else {
            res.status(400).json({message: "Trạng thái thanh toán không hợp lệ"})
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi máy chủ"});
    }
});

// POST /api/checkout/:id/finalize
// Hoàn tất thanh toán và chuyển đổi thành đơn hàng sau khi xác nhận thanh toán
router.post("/:id/finalize", protect, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({message: "Không tìm thấy thanh toán"});
        }

        if (checkout.isPaid && !checkout.isFinalized) {
            //Tạo đơn hàng cuối cùng dựa trên chi tiết thanh toán
            const finalOrder = await Order.create({
                user: checkout.user,
                orderItems: checkout.checkoutItems,
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: true,
                paidAt: checkout.paidAt,
                isDelivered: false,
                paymentStatus: "paid",
                paymentDetails: checkout.paymentDetails,
            });

            // Đánh dấu thanh toán là đã hoàn tất
            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();
            // Xóa giỏ hàng được liên kết với người dùng
            await Cart.findOneAndDelete({user: checkout.user});
            res.status(201).json(finalOrder);
        } else if (checkout.isFinalized) {
            res.status(400).json({message: "Thanh toán đã hoàn tất"});
        } else {
            res.status(400).json({message: "Thanh toán không được thực hiện"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Lỗi máy chủ"});
    }
});

module.exports = router;