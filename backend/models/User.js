const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/.+\@.+\..+/, "Vui lòng nhập địa chỉ email hợp lệ"],
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
        },
        role: {
            type: String,
            enum: ["Khách hàng", "Quản trị viên"],
            default: "Khách hàng",
        },
    },
    {timestamps: true}
);

// Middleware mã hóa mật khẩu
userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

// So sánh mật khẩu người dùng với mật khẩu đã được mã hóa

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model("User", userSchema);