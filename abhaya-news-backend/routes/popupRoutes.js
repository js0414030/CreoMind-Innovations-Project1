const express = require('express');
const router = express.Router();
const popupController = require('../controllers/popupController');
const upload = require('../middleware/upload');

// Public route to get active popup image
router.get('/active', popupController.getActivePopupImage);

// Admin routes (no authentication required per current requirement)
router.post('/upload', upload.single('image'), popupController.uploadPopupImage);
router.get('/all', popupController.getAllPopupImages);
router.put('/:id', upload.single('image'), popupController.updatePopupImage);
router.delete('/:id', popupController.deletePopupImage);
router.patch('/:id/toggle', popupController.togglePopupImageStatus);

module.exports = router;

