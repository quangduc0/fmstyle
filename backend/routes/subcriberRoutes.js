const express = require("express");
const Subscriber = require("../models/Subscriber");

const router = express.Router();

// POST /api/subscribe
router.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Bắt buộc là email" });
    }

    try {
        let subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            return res.status(400).json({ message: "Email đã được đăng ký" });
        }

        subscriber = new Subscriber({ email });
        await subscriber.save();

        res.status(201).json({ message: "Đăng ký nhận bản tin thành công!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

module.exports = router;