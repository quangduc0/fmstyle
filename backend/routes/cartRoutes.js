const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Hàm trợ giúp để lấy giỏ hàng theo userId hoặc guestId
const getCart = async (userId, guestId) => {
    if (userId) {
        return await Cart.findOne({ user: userId });
    } else if (guestId) {
        return await Cart.findOne({ guestId });
    }
    return null;
}

// POST /api/cart (thêm sản phẩm vào giỏ hàng)
router.post("/", async (req, res) => {
    const {
        productId,
        quantity,
        size,
        color,
        guestId,
        userId,
    } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!productId) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        // Xác định xem người dùng đã đăng nhập hay khách
        let cart = await getCart(userId, guestId);

        // Nếu giỏ hàng tồn tại, cập nhật nó
        if (cart) {
            const productIndex = cart.products.findIndex(
                (p) => p.productId.toString() === productId && p.size === size && p.color === color
            );

            if (productIndex > -1) {
                // Nếu sản phẩm đã có thì cập nhật số lượng
                cart.products[productIndex].quantity += quantity;
            } else {
                // Thêm sản phẩm mới
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity,
                });
            }

            // Tính lại tổng giá
            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save();
            return res.status(200).json(cart);
        } else {
            // Tạo giỏ hàng mới cho khách hoặc người dùng
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {
                        productId,
                        name: product.name,
                        image: product.images[0].url,
                        price: product.price,
                        size,
                        color,
                        quantity,
                    },
                ],
                totalPrice: product.price * quantity,
            });
            return res.status(201).json(newCart)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// PUT /api/cart (cập nhật số lượng sản phẩm trong giỏ hàng)
router.put("/", async (req, res) => {
    const {
        productId,
        quantity,
        size,
        color,
        guestId,
        userId
    } = req.body;
    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId && p.size === size && p.color === color
        );

        if (productIndex > -1) {
            // Cập nhật số lượng
            if (quantity > 0) {
                cart.products[productIndex].quantity = quantity;
            } else {
                cart.products.splice(productIndex, 1); //Xóa sản phẩm nếu số lượng bằng 0
            }

            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// DELETE /api/cart (Xóa sản phẩm khỏi giỏ hàng)
router.delete("/", async (req, res) => {
    const {
        productId,
        size,
        color,
        guestId,
        userId
    } = req.body;
    try {
        let cart = await getCart(userId, guestId);

        if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId && p.size === size && p.color === color
        );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);

            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// GET /api/cart (Lấy giỏ hàng)
router.get("/", async (req, res) => {
    const { userId, guestId } = req.query;

    try {
        const cart = await getCart(userId, guestId);
        if (cart) {
            res.json(cart);
        } else {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// POST /api/cart/merge
router.post("/merge", protect, async (req, res) => {
    const { guestId } = req.body;

    try {
        const guestCart = await Cart.findOne({ guestId });
        const userCart = await Cart.findOne({ user: req.user._id });

        if (guestCart) {
            if (guestCart.products.length === 0) {
                return res.status(400).json({ message: "Giỏ hàng khách trống" })
            }
            if (userCart) {
                guestCart.products.forEach((guestItem) => {
                    const productIndex = userCart.products.findIndex(
                        (item) => item.productId.toString() === guestItem.productId.toString() && item.size && item.color === guestItem.color
                    );

                    if (productIndex > -1) {
                        userCart.products[productIndex].quantity += guestItem.quantity;
                    } else {
                        userCart.products.push(guestItem)
                    }
                });
                userCart.totalPrice = userCart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
                await userCart.save();

                try {
                    await Cart.findOneAndDelete({ guestId });
                } catch (error) {
                    console.error("Lỗi khi xóa giỏ hàng khách:", error);
                }
                res.status(200).json(userCart);
            } else {
                guestCart.user = req.user._id;
                guestCart.guestId = undefined;
                await guestCart.save();

                res.status(200).json(guestCart);
            }
        } else {
            if (userCart) {
                return res.status(200).json(userCart);
            }
            return res.status(400).json({ message: "Giỏ hàng khách trống" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
})

module.exports = router;