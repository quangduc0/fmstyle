const express = require("express");
const Product = require("../models/Product");
const Promotion = require("../models/Promotion");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/products
router.post("/", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            sku,
        } = req.body;

        const product = new Product({
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            sku,
            user: req.user._id,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi máy chủ");
    }
});

// PUT /api/products/:id
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            sku,
        } = req.body;

        // Tìm sản phẩm theo ID
        const product = await Product.findById(req.params.id);

        if (product) {
            // Cập nhật trường sản phẩm
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.collections = collections || product.collections;
            product.material = material || product.material;
            product.gender = gender || product.gender;
            product.images = images || product.images;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;
            product.tags = tags || product.tags;
            product.sku = sku || product.sku;

            // Lưu sản phẩm đã cập nhật
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi máy chủ");
    }
});

// DELETE /api/product/:id
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        // Tìm sản phẩm theo ID
        const product = await Product.findById(req.params.id);

        if (product) {
            // Xóa sản phẩm khỏi DB
            await product.deleteOne();
            res.json({ message: "Đã xóa sản phẩm" });
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi máy chủ");
    }
});

// GET /api/products (Lấy tất các sản phẩm)
router.get("/", async (req, res) => {
    try {
        const {
            collection,
            size,
            color,
            gender,
            minPrice,
            maxPrice,
            sortBy,
            search,
            category,
            material,
            brand,
            limit
        } = req.query;

        let query = {};

        if (collection && collection.toLocaleLowerCase() !== "all") {
            query.collections = collection;
        }

        if (category && category.toLocaleLowerCase() !== "all") {
            query.category = category;
        }

        if (material) {
            query.material = { $in: material.split(",") };
        }

        if (brand) {
            query.brand = { $in: brand.split(",") };
        }

        if (size) {
            query.sizes = { $in: size.split(",") };
        }

        if (color) {
            query.colors = { $in: [color] };
        }

        if (gender) {
            query.gender = gender;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        let sort = {};
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    break;
                case "priceDesc":
                    sort = { price: -1 };
                    break;
                case "popularity":
                    sort = { rating: -1 };
                    break;
                default:
                    break;
            }
        }

        let products = await Product.find(query).sort(sort).limit(Number(limit) || 0);

        const now = new Date();
        const activePromotions = await Promotion.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        if (activePromotions.length > 0) {
            products = products.map(product => {
                const productObj = product.toObject();

                const applicablePromotion = activePromotions.find(promo => {
                    return promo.categories.includes('All') ||
                        (product.category && promo.categories.includes(product.category)) ||
                        (product.gender && promo.categories.includes(product.gender));
                });

                if (applicablePromotion) {
                    const discountAmount = (product.price * (applicablePromotion.discountPercent / 100));
                    productObj.discountPrice = Math.floor(product.price - discountAmount);
                    productObj.discountPercent = applicablePromotion.discountPercent;
                }

                return productObj;
            });
        }

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi máy chủ");
    }
});

// GET /api/products/best-seller (Lấy sản phẩm được đánh giá cao nhất)
router.get("/best-seller", async (req, res) => {
    try {
        const bestSeller = await Product.findOne().sort({ rating: -1 });

        if (bestSeller) {
            res.json(bestSeller);
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm bán chạy nhất" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi máy chủ");
    }
})

// GET /api/products/new-arrivals (Xuất 8 sản phẩm mới nhất)
router.get("/new-arrivals", async (req, res) => {
    try {
        const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
        res.json(newArrivals);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi máy chủ");
    }
})

// GET /api/products/similar/:id
// Xuất các sản phẩm tương tự dựa trên giới tính và danh mục của sản phẩm hiện tại
router.get("/similar/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        let similarProducts = await Product.find({
            _id: { $ne: id }, // loại trừ Id sản phẩm hiện tại
            gender: product.gender,
            category: product.category,
        }).limit(4);

        const now = new Date();
        const activePromotions = await Promotion.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        similarProducts = similarProducts.map(p => {
            const productObj = p.toObject();
            const promo = activePromotions.find(pr =>
                pr.categories.includes("All") ||
                pr.categories.includes(productObj.category) ||
                pr.categories.includes(productObj.gender)
            );
            if (promo) {
                const discountAmount = productObj.price * promo.discountPercent / 100;
                productObj.discountPrice = Math.floor(productObj.price - discountAmount);
                productObj.discountPercent = promo.discountPercent;
            }
            return productObj;
        });

        res.json(similarProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi máy chủ");
    }
});

// GET /api/products/:id (Lấy một sản phẩm bằng ID)
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            const productObj = product.toObject();

            const now = new Date();
            const activePromotions = await Promotion.find({
                isActive: true,
                startDate: { $lte: now },
                endDate: { $gte: now }
            });

            if (activePromotions.length > 0) {
                const applicablePromotion = activePromotions.find(promo => {
                    return promo.categories.includes('All') ||
                        (product.category && promo.categories.includes(product.category)) ||
                        (product.gender && promo.categories.includes(product.gender));
                });

                if (applicablePromotion) {

                    const discountAmount = (product.price * (applicablePromotion.discountPercent / 100));
                    productObj.discountPrice = Math.floor(product.price - discountAmount);
                    productObj.discountPercent = applicablePromotion.discountPercent;
                }
            }
            res.json(productObj);
        } else {
            res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi máy chủ");
    }
});


module.exports = router;