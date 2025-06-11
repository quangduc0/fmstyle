const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Promotion = require("../models/Promotion");
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

const cleanupExpiredItems = async (cart) => {
    if (!cart || !cart.products || cart.products.length === 0) {
        return { cart, removedItems: [] };
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 5); // Có thể thay đổi ngày để xóa sản phẩm trong giỏ hàng

    const expiredItems = [];
    const validItems = [];

    cart.products.forEach(product => {
        const addedAt = product.addedAt || new Date();
        if (addedAt < daysAgo) {
            expiredItems.push({
                name: product.name,
                size: product.size,
                color: product.color,
                quantity: product.quantity,
                addedAt: product.addedAt
            });
        } else {
            validItems.push(product);
        }
    });

    if (expiredItems.length > 0) {
        cart.products = validItems;
        cart.totalPrice = validItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        await cart.save();
        console.log(`Đã xóa ${expiredItems.length} sản phẩm hết hạn từ giỏ hàng`);
    }

    return { cart, removedItems: expiredItems };
};

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
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        const now = new Date();
        const activePromotions = await Promotion.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
        
        let effectivePrice = product.price;
        if (product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price) {
            effectivePrice = product.discountPrice;
        }
        
        if (activePromotions.length > 0) {
            const applicablePromotion = activePromotions.find(promo => {
                return promo.categories.includes('All') || 
                      (product.category && promo.categories.includes(product.category)) ||
                      (product.gender && promo.categories.includes(product.gender));
            });
            
            if (applicablePromotion) {
                const discountAmount = (product.price * (applicablePromotion.discountPercent / 100));
                const promotionPrice = Math.floor(product.price - discountAmount);
                
                effectivePrice = Math.min(effectivePrice, promotionPrice);
            }
        }

        // Xác định xem người dùng đã đăng nhập hay khách
        let cart = await getCart(userId, guestId);
        let removedItems = [];
        if (cart) {
            const cleanupResult = await cleanupExpiredItems(cart);
            cart = cleanupResult.cart;
            removedItems = cleanupResult.removedItems;
        }

        // Nếu giỏ hàng tồn tại, cập nhật nó
        if (cart) {
            const productIndex = cart.products.findIndex(
                (p) => p.productId.toString() === productId && p.size === size && p.color === color
            );
            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity;
                cart.products[productIndex].addedAt = new Date();
            } else {
                // Thêm sản phẩm mới
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: effectivePrice,
                    size,
                    color,
                    quantity,
                    addedAt: new Date(),
                });
            }
            // Tính lại tổng giá
            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save();
            
            return res.status(200).json({
                ...cart.toObject(),
                removedItems: removedItems.length > 0 ? removedItems : undefined
            });
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
                        price: effectivePrice,
                        size,
                        color,
                        quantity,
                        addedAt: new Date(),
                    },
                ],
                totalPrice: effectivePrice * quantity,
            });
            return res.status(201).json(newCart);
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
        const cleanupResult = await cleanupExpiredItems(cart);
        cart = cleanupResult.cart;
        const removedItems = cleanupResult.removedItems;

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId && p.size === size && p.color === color
        );

        if (productIndex > -1) {
            if (quantity > 0) {
                cart.products[productIndex].quantity = quantity;
                cart.products[productIndex].addedAt = new Date();
            } else {
                cart.products.splice(productIndex, 1);
            }

            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save();
            
            return res.status(200).json({
                ...cart.toObject(),
                removedItems: removedItems.length > 0 ? removedItems : undefined
            });
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
        const cleanupResult = await cleanupExpiredItems(cart);
        cart = cleanupResult.cart;
        const removedItems = cleanupResult.removedItems;

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId && p.size === size && p.color === color
        );

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);

            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save();
            
            return res.status(200).json({
                ...cart.toObject(),
                removedItems: removedItems.length > 0 ? removedItems : undefined
            });
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
        let cart = await getCart(userId, guestId);
        if (cart) {
            const cleanupResult = await cleanupExpiredItems(cart);
            cart = cleanupResult.cart;
            const removedItems = cleanupResult.removedItems;
            
            res.json({
                ...cart.toObject(),
                removedItems: removedItems.length > 0 ? removedItems : undefined
            });
        } else {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// POST /api/cart/cleanup
router.post("/cleanup", async (req, res) => {
    const { userId, guestId } = req.body;
    
    try {
        let cart = await getCart(userId, guestId);
        if (!cart) {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        }
        
        const cleanupResult = await cleanupExpiredItems(cart);
        
        return res.status(200).json({
            ...cleanupResult.cart.toObject(),
            removedItems: cleanupResult.removedItems,
            message: `Đã xóa ${cleanupResult.removedItems.length} sản phẩm hết hạn`
        });
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
            const guestCleanupResult = await cleanupExpiredItems(guestCart);
            const cleanedGuestCart = guestCleanupResult.cart;
            
            if (cleanedGuestCart.products.length === 0) {
                return res.status(400).json({ message: "Giỏ hàng khách trống" })
            }
            
            if (userCart) {
                const userCleanupResult = await cleanupExpiredItems(userCart);
                const cleanedUserCart = userCleanupResult.cart;
                
                cleanedGuestCart.products.forEach((guestItem) => {
                    const productIndex = cleanedUserCart.products.findIndex(
                        (item) => item.productId.toString() === guestItem.productId.toString() && 
                                  item.size === guestItem.size && 
                                  item.color === guestItem.color
                    );

                    if (productIndex > -1) {
                        cleanedUserCart.products[productIndex].quantity += guestItem.quantity;

                        cleanedUserCart.products[productIndex].addedAt = new Date();
                    } else {
                        guestItem.addedAt = new Date();
                        cleanedUserCart.products.push(guestItem);
                    }
                });
                
                cleanedUserCart.totalPrice = cleanedUserCart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
                await cleanedUserCart.save();

                try {
                    await Cart.findOneAndDelete({ guestId });
                } catch (error) {
                    console.error("Lỗi khi xóa giỏ hàng khách:", error);
                }
                
                const totalRemovedItems = [...guestCleanupResult.removedItems, ...userCleanupResult.removedItems];
                
                res.status(200).json({
                    ...cleanedUserCart.toObject(),
                    removedItems: totalRemovedItems.length > 0 ? totalRemovedItems : undefined
                });
            } else {
                cleanedGuestCart.user = req.user._id;
                cleanedGuestCart.guestId = undefined;
                await cleanedGuestCart.save();

                res.status(200).json({
                    ...cleanedGuestCart.toObject(),
                    removedItems: guestCleanupResult.removedItems.length > 0 ? guestCleanupResult.removedItems : undefined
                });
            }
        } else {
            if (userCart) {
                const userCleanupResult = await cleanupExpiredItems(userCart);
                return res.status(200).json({
                    ...userCleanupResult.cart.toObject(),
                    removedItems: userCleanupResult.removedItems.length > 0 ? userCleanupResult.removedItems : undefined
                });
            }
            return res.status(400).json({ message: "Giỏ hàng khách trống" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
})

module.exports = router;