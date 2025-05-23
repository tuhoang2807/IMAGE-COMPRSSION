const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const db = require("./config/db");
const imageRoutes = require('./routes/imageRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: "http://127.0.0.1:5500", // Hoặc http://localhost:5500 nếu Live Server chạy ở đó
    credentials: true
}));

app.use(bodyParser.json()); // Xử lý JSON request
app.use(bodyParser.urlencoded({ extended: true })); // Xử lý form data

// Kết nối database
db.connect((err) => {
    if (err) {
        console.error("Lỗi kết nối database:", err);
    } else {
        console.log("✅ Database đã kết nối!");
    }
});

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/images', imageRoutes);





// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
