const db = require("../config/db");

const Post = {
  getAllPosts: () => {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT 
              posts.id AS post_id, 
              posts.user_id, 
              users.username, 
              posts.title, 
              posts.description, 
              images.original_url AS image_url 
            FROM posts
            JOIN images ON posts.image_id = images.id
            JOIN users ON posts.user_id = users.id  
            ORDER BY posts.id DESC
          `;

      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  createPost: (userId, imageId, title, description) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO posts (user_id, image_id, title, description) VALUES (?, ?, ?, ?)`;
      db.query(sql, [userId, imageId, title, description], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  },

  deletePost: (postId, userId) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM posts WHERE id = ? AND user_id = ?`;
      db.query(sql, [postId, userId], (err, result) => {
        if (err) return reject(err);

        if (result.affectedRows === 0) {
          return reject(new Error("Post not found or unauthorized"));
        }
        resolve({ success: true });
      });
    });
  },

  searchPosts: (keyword) => {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT 
              posts.id AS post_id, 
              posts.user_id, 
              users.username, 
              posts.title, 
              posts.description, 
              images.original_url AS image_url 
            FROM posts
            JOIN images ON posts.image_id = images.id
            JOIN users ON posts.user_id = users.id  
            WHERE posts.title LIKE ? OR posts.description LIKE ?
            ORDER BY posts.id DESC
          `;
      const searchKeyword = `%${keyword}%`;
      db.query(sql, [searchKeyword, searchKeyword], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getPostsByUser: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT 
              posts.id AS post_id, 
              posts.user_id, 
              users.username, 
              posts.title, 
              posts.description, 
              images.original_url AS image_url 
            FROM posts
            JOIN images ON posts.image_id = images.id
            JOIN users ON posts.user_id = users.id  
            WHERE posts.user_id = ?
            ORDER BY posts.id DESC
          `;
      db.query(sql, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
};

module.exports = Post;