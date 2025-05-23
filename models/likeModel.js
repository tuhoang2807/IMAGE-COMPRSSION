const db = require('../config/db');

const Like = {
  toggleLike: (userId, postId) => {
    return new Promise((resolve, reject) => {
      const checkSql = `SELECT id FROM likes WHERE user_id = ? AND post_id = ?`;
      db.query(checkSql, [userId, postId], (err, result) => {
        if (err) return reject(err);

        if (result.length > 0) {
          const deleteSql = `DELETE FROM likes WHERE user_id = ? AND post_id = ?`;
          db.query(deleteSql, [userId, postId], (deleteErr) => {
            if (deleteErr) return reject(deleteErr);
            resolve({ liked: false });
          });
        } else {
          const insertSql = `INSERT INTO likes (user_id, post_id) VALUES (?, ?)`;
          db.query(insertSql, [userId, postId], (insertErr) => {
            if (insertErr) return reject(insertErr);
            resolve({ liked: true });
          });
        }
      });
    });
  },

  getLikeCount: (postId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ?`;
      db.query(sql, [postId], (err, result) => {
        if (err) return reject(err);
        resolve(result[0].likeCount);
      });
    });
  },

  getLikedPosts: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.id AS post_id, p.user_id, p.title, i.original_url AS image_url, p.description, p.created_at
        FROM posts p
        JOIN likes l ON p.id = l.post_id
        JOIN images i ON p.image_id = i.id
        WHERE l.user_id = ?
      `;
      db.query(sql, [userId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
}

};

module.exports = Like;
