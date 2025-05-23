const db = require("../config/db");
const bcrypt = require("bcryptjs");


exports.findByEmail = (email, callback) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]);
    });
};

exports.findByUsername = (username, callback) => {
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]);
    });
};

exports.checkPassword = (userId, password, callback) => {
    const query = "SELECT password FROM users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
        if (err) return callback(err, null);
        if (results.length === 0) return callback(null, false);
        const hashedPassword = results[0].password;
        bcrypt.compare(password, hashedPassword, (err, isMatch) => {
            if (err) return callback(err, null);
            callback(null, isMatch);
        });
    });
};

exports.createUser = async (username, email, password, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result.insertId);
        });
    } catch (error) {
        callback(error, null);
    }
};
