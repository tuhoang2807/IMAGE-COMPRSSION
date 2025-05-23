const db = require('../config/db');

exports.uploadImage = (userId, originalUrl, compressedUrl, quality, callback) => {
  const sql = 'INSERT INTO images (user_id, original_url, compressed_url, quality) VALUES (?, ?, ?, ?)';
  db.query(sql, [userId, originalUrl, compressedUrl, quality], callback);
};
