const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/users/register
router.post("/register", async (req, res) => {
    const {name, email, password} = req.body;

    try{
        let user = await User.findOne({email});

        if(user) return res.status(400).json({message: "Người dùng đã tồn tại"});

        user = new User ({name, email, password});
        await user.save();

        // Tạo dữ liệu cho Jison Web Token
        const payload = {
            user: {
                id: user._id,
                role: user.role,
            },
        };
        // Xác thực token và gửi lại cùng dữ liệu người dùng
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "40h"}, (err, token) => {
            if(err) throw err;

            // Trả về thông tin người dùng và token
            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            })
        });

    } catch (error){
        console.log(error);
        res.status(500).send("Lỗi máy chủ");
    }
})

// POST /api/users/login
router.post("/login", async (req, res) => {
    const {email, password} = req.body;

    try {
        // Tìm người dùng qua email
        let user = await User.findOne({email});

        if(!user) return res.status(400).json({message: "Thông tin xác thực không hợp lệ"});
        const isMatch = await user.matchPassword(password);

        if(!isMatch) return res.status(400).json({message: "Thông tin xác thực không hợp lệ"});

        // Tạo dữ liệu cho Jiso Web Token
        const payload = {
            user: {
                id: user._id,
                role: user.role,
            },
        };
        // Xác thực token và gửi lại cùng dữ liệu người dùng
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "40h"}, (err, token) => {
            if(err) throw err;

            // Trả về thông tin người dùng và token
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            })
        });

    } catch(error){
        console.error(error);
        res.status(500).send("Lỗi máy chủ")
    }
})

// GET /api/users/profile
router.get("/profile", protect, async (req, res) => {
    res.json(req.user);
})

module.exports = router;