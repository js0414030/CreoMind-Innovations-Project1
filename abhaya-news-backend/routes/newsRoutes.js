const express = require('express');
const router = express.Router();
const { uploadNews, getAllNews, getNewsById } = require('../controllers/newsController');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');


// New route for image upload + news data
router.post(
  '/upload',
  protect,
  upload.single('image'),    // ‘image’ is the form field name
  uploadNews
);

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Protected route
router.post('/upload', protect, uploadNews);

module.exports = router;
