const express = require('express');
const multer = require('multer');
const imageController = require('../controllers/imageController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), imageController.uploadImage);
router.post('/like', imageController.toggleLike);
router.post('/delete', imageController.deletePost);
router.get('/posts', imageController.getAllPosts);
router.get("/liked-posts/:userId", imageController.getLikedPosts);
router.get("/search", imageController.searchPosts);
router.get("/download-image", imageController.downloadImage);
router.get("/my-posts/:userId", imageController.getPostsByUser);
module.exports = router;
