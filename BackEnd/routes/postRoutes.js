const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { upload } = require('../middleware/upload');

router.get('/:userId', postController.getPosts);
router.post('/', upload.single('post_image'), postController.createPost);

module.exports = router;
