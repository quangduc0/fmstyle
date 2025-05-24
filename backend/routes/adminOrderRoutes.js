const express = require("express");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/admin/orders
router.get("/", protect, admin, async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// PUT /api/admin/orders/:id (cập nhập trạng thái đơn hàng)
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name");
        if (order) {
            order.status = req.body.status || order.status;
            order.isDelivered = req.body.status === "Delivered" ? true : order.isDelivered;
            order.deliveredAt = req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// PUT /api/admin/orders/:id/payment (cập nhật trạng thái thanh toán)
router.put("/:id/payment", protect, admin, async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        
        if (!paymentStatus || !["pending", "paid", "unpaid", "failed"].includes(paymentStatus)) {
            return res.status(400).json({ message: "Trạng thái thanh toán không hợp lệ" });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
        
        order.paymentStatus = paymentStatus;
        
        if (paymentStatus === "paid" && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
        }
        
        if (paymentStatus === "unpaid" || paymentStatus === "failed") {
            order.isPaid = false;
            order.paidAt = null;
        }
        
        const updatedOrder = await order.save();
        
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// DELETE /api/admin/orders/:id
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if(order){
            await order.deleteOne();
            res.json({message: "Đã xóa đơn hàng"});
        } else {
            res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

module.exports = router;