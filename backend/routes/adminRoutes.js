const express = require("express");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/admin/users (lấy tất cả người dùng)
router.get("/", protect, admin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// POST /api/admin/user (thêm người dùng mới)
router.post("/", protect, admin, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Người dùng đã tồn tại" });
        }

        user = new User({
            name,
            email,
            password,
            role: role || "Khách hàng",
        });

        await user.save();
        return res.status(201).json({ message: "Thêm người dùng thành công", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// PUT /api/admin/users/:id (cập nhật thông tin người dùng)
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
        }
        const updatedUser = await user.save();
        return res.json({ message: "Cập nhật người dùng thành công", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// DELETE /api/admin/user/:id
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user) {
            await user.deleteOne();
            return res.json({ message: "Xóa người dùng thành công" });
        } else {
            res.status(404).json({ message: "không tìm thấy người dùng" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
})

module.exports = router;
