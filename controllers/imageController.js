const sharp = require("sharp");
const Image = require("../models/imageModel");
const Post = require("../models/postModel");
const cloudinary = require("../config/cloudinary");
const Like = require("../models/likeModel");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.getAllPosts();
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { keyword } = req.query; // Sửa từ req.body -> req.query
    if (!keyword) {
      return res
        .status(400)
        .json({ success: false, message: "Keyword is required" });
    }

    const posts = await Post.searchPosts(keyword);
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const compressedBuffer = await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    cloudinary.uploader
      .upload_stream(
        { resource_type: "image", format: "webp", folder: "uploads" },
        async (error, cloudinaryResult) => {
          if (error) {
            return res.status(500).json({ message: "Upload failed", error });
          }

          const originalUrl = cloudinaryResult.secure_url;
          const compressedUrl = cloudinaryResult.secure_url;

          Image.uploadImage(
            userId,
            originalUrl,
            compressedUrl,
            80,
            (err, result) => {
              if (err) {
                console.error(err);
                return res
                  .status(500)
                  .json({ message: "Database error", error: err });
              }
              Post.createPost(
                userId,
                result.insertId,
                req.body.title,
                req.body.description
              );

              res.json({
                success: true,
                imageId: result.insertId,
                originalUrl,
                compressedUrl,
              });
            }
          );
        }
      )
      .end(compressedBuffer);
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "Post ID and User ID are required" });
    }

    await Post.deletePost(postId, userId);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Database error", error });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { userId, postId } = req.body;
    if (!userId || !postId) {
      return res
        .status(400)
        .json({ message: "User ID and Post ID are required" });
    }

    const result = await Like.toggleLike(userId, postId);
    const likeCount = await Like.getLikeCount(postId);

    res.json({ success: true, liked: result.liked, likeCount });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
};

exports.getLikedPosts = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ URL

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const likedPosts = await Like.getLikedPosts(userId);

    res.json({ success: true, likedPosts });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
};

exports.getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ URL

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const posts = await Post.getPostsByUser(userId);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: "Database error", error });
  }
};

exports.downloadImage = async (req, res) => {
  try {
    const { imageUrl } = req.query;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });

    const filename = path.basename(imageUrl);
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", response.headers["content-type"]);

    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Download failed", error });
  }
};
