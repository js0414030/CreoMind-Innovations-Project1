const express = require('express');
const router = express.Router();
const popupController = require('../controllers/popupController');
const upload = require('../middleware/upload');

// Popup News CRUD
router.get('/popup-news', popupController.getAllPopupNews);
router.get('/popup-news/active', popupController.getActivePopupNews);
router.post('/popup-news', popupController.createPopupNews);
router.put('/popup-news/:id', popupController.updatePopupNews);
router.delete('/popup-news/:id', popupController.deletePopupNews);
router.patch('/popup-news/:id/activate', popupController.activatePopupNews);

// Image upload
router.post('/upload-popup-image', upload.single('image'), popupController.uploadPopupNewsImage);

module.exports = router;

