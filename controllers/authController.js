const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ statusCode: 400, message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if(email.indexOf("@") === -1) {
        return res.status(400).json({ statusCode: 400, message: "Email không hợp lệ" });
    }
    
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/; 
    if (password.length < 6 || !specialCharRegex.test(password)) {
        return res.status(400).json({ statusCode: 400, message: "Mật khẩu phải có ít nhất 6 ký tự và chứa ít nhất 1 ký tự đặc biệt" });
    }

    User.findByEmail(email, (err, existingUserByEmail) => {
        if (err) {
            console.error("Lỗi kiểm tra email:", err);
            return res.status(500).json({ statusCode: 500, message: "Lỗi server. Vui lòng thử lại!" });
        }

        if (existingUserByEmail) {
            return res.status(409).json({ statusCode: 409, message: "Email đã được sử dụng" });
        }

        User.findByUsername(username, (err, existingUserByUsername) => {
            if (err) {
                console.error("Lỗi kiểm tra username:", err);
                return res.status(500).json({ statusCode: 500, message: "Lỗi server. Vui lòng thử lại!" });
            }

            if (existingUserByUsername) {
                return res.status(409).json({ statusCode: 409, message: "Tên tài khoản đã tồn tại" });
            }

            User.createUser(username, email, password, (err, userId) => {
                if (err) {
                    console.error("Lỗi khi tạo user:", err);
                    return res.status(500).json({ statusCode: 500, message: "Đăng ký thất bại. Vui lòng thử lại!" });
                }

                res.status(201).json({ statusCode: 201, message: "Đăng ký thành công!", userId });
            });
        });
    });
};




exports.login = (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ statusCode: 400, message: "Vui lòng nhập đầy đủ thông tin." });
    }
    
    User.findByUsername(username, (err, user) => {
        if (err) {
            console.error("Lỗi tìm kiếm user:", err);
            return res.status(500).json({ statusCode: 500, message: "Lỗi server. Vui lòng thử lại!", error: err });
        }
        if (!user) {
            return res.status(401).json({ statusCode: 401, message: "Tài khoản hoặc mật khẩu không chính xác." });
        }

        User.checkPassword(user.id, password, (err, isMatch) => {
            if (err) {
                console.error("Lỗi kiểm tra mật khẩu:", err);
                return res.status(500).json({ statusCode: 500, message: "Lỗi server. Vui lòng thử lại!", error: err });
            }
            if (!isMatch) {
                return res.status(401).json({ statusCode: 401, message: "Tài khoản hoặc mật khẩu không chính xác." });
            }

            if (!process.env.JWT_SECRET) {
                console.error("LỖI: JWT_SECRET không được định nghĩa!");
                return res.status(500).json({ statusCode: 500, message: "Lỗi server. Vui lòng thử lại sau!" });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: "1h" }
            );

            res.cookie("token", token, {
                httpOnly: true,   
                secure: process.env.NODE_ENV === "production", 
                sameSite: "Strict", 
                maxAge: 3600000, // 1 giờ
            });

            res.json({ 
                statusCode: 200, 
                message: "Đăng nhập thành công!",
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email, 
                    role: user.role
                }
            });
        });
    });
};


