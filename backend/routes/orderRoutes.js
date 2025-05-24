const express = require("express");
const Order = require("../models/Order");
const Product = require('../models/Product');
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/orders/my-order
router.get("/my-orders", protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// GET /api/orders/:id
router.get("/:id", protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

router.post('/:id/update-inventory', protect, admin, async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log('API cập nhật tồn kho được gọi với orderId:', orderId);
    console.log('User thực hiện:', req.user.name, 'ID:', req.user._id);
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.log('Không tìm thấy đơn hàng:', orderId);
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    console.log('Thông tin đơn hàng:', {
      id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      inventoryUpdated: order.inventoryUpdated,
      orderItems: order.orderItems.length
    });
    
    if (order.status !== 'Delivered' || order.paymentStatus !== 'paid') {
      console.log('Điều kiện không thỏa mãn: status =', order.status, 'paymentStatus =', order.paymentStatus);
      return res.status(400).json({ 
        message: 'Chỉ cập nhật tồn kho cho đơn hàng đã giao và đã thanh toán' 
      });
    }
    
    if (order.inventoryUpdated) {
      console.log('Tồn kho đã được cập nhật trước đó');
      return res.status(400).json({ message: 'Tồn kho đã được cập nhật cho đơn hàng này' });
    }
    
    console.log('Bắt đầu cập nhật tồn kho cho', order.orderItems.length, 'sản phẩm');
    
    const updatePromises = order.orderItems.map(async (item) => {
      console.log('Đang xử lý sản phẩm:', item.productId, 'Số lượng:', item.quantity);
      const product = await Product.findById(item.productId);
      
      if (product) {
        console.log(`Cập nhật tồn kho sản phẩm ${product.name} từ ${product.countInStock} giảm ${item.quantity}`);
        product.countInStock = Math.max(0, product.countInStock - item.quantity);
        return product.save();
      } else {
        console.log('Không tìm thấy sản phẩm:', item.productId);
        return null;
      }
    });
    
    const results = await Promise.all(updatePromises);
    console.log('Kết quả cập nhật:', results.filter(r => r).length, 'sản phẩm đã được cập nhật');
    
    order.inventoryUpdated = true;
    await order.save();
    console.log('Đã đánh dấu đơn hàng là đã cập nhật tồn kho');
    
    res.status(200).json({ 
      success: true, 
      message: 'Cập nhật tồn kho thành công'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật tồn kho:', error);
    res.status(500).json({ 
      message: 'Lỗi khi cập nhật tồn kho',
      error: error.message
    });
  }
});

router.get('/user/:userId', protect, admin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ user: userId }).populate('user', 'name email').sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;