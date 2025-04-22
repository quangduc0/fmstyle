const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/product");

dotenv.config();

// Kết nối với MongoDB
mongoose.connect(process.env.MONGO_URI);

// Hàm tạo seed data
const seedData = async () => {
    try {
        // Xóa dữ liệu hiện có
        await Product.deleteMany();
        await User.deleteMany();

        // Tạo mặc định admin User
        const createdUser = await User.create({
            name: "Admin User",
            email: "admin@gmail.com",
            password: "123456",
            role: "Quản trị viên",
        });

        // Gán mặc định ID người dùng cho từng sản phẩm
        const userID = createdUser._id;

        const sampleProduct = products.map((product) => {
            return {...product, user: userID};
        });

        // Chèn sản phẩm vào cơ sở dữ liệu
        await Product.insertMany(sampleProduct);

        console.log("Product data seeded successfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding the data:", error);
        process.exit();
    }
};

seedData();