const jwt = require("jsonwebtoken");
const User = require("../models/User")

// Middleware dùng để xác thực truy cập
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.user.id).select("-password");
            next();
        } catch (error) {
            console.error("xác minh Token không thành công:", error);
            res.status(401).json({ message: "Không được cấp quyền, token không hợp lệ" });
        }
    } else {
        res.status(401).json({ message: "Không được cấp quyền, không có token được cung cấp" })
    }
};

// Middleware để kiểm tra xem user có phải là admin hay không
const admin = (req, res, next) => {
    if (req.user && req.user.role === "Quản trị viên") {
        next();
    } else {
        res.status(403).json({ message: "Không phải là quản trị viên" });
    }
}

module.exports = { protect, admin };