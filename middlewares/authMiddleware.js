const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Không có token, truy cập bị từ chối" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "secret_key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token không hợp lệ" });
        }

        req.user = decoded; 
        next(); 
    });
};
