const express = require('express');
const router = express.Router();
const { uploadNews, getAllNews, getNewsById, updateNews, deleteNews} = require('../controllers/newsController');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');


// New route for image upload + news data
router.post(
  '/upload',
  protect,
  upload.single('image'),    // ‘image’ is the form field name
  uploadNews
);

// Update route — image is optional
router.put(
  '/:id',
  protect,
  upload.single('image'),   // Optional image update
  updateNews
);

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Protected route
// router.post('/upload', protect, uploadNews);
// DELETE route
router.delete('/:id', protect, deleteNews);

module.exports = router;
