const PopupImage = require('../models/PopupImage');
const cloudinary = require('../config/cloudinary');

// Upload popup image
const uploadPopupImage = async (req, res) => {
    try {
        console.log('Upload popup image request received');
        console.log('Admin user:', req.admin);

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Upload to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'popup-images',
            width: 800,
            height: 600,
            crop: 'fill'
        });

        // Deactivate all existing popup images
        await PopupImage.updateMany({}, { isActive: false });

        // Create new popup image
        const popupImage = new PopupImage({
            imageUrl: result.secure_url,
            title: req.body.title || '',
            description: req.body.description || '',
            isActive: true
        });

        await popupImage.save();

        res.status(201).json({
            message: 'Popup image uploaded successfully',
            popupImage
        });
    } catch (error) {
        console.error('Error uploading popup image:', error);
        res.status(500).json({ message: 'Error uploading popup image' });
    }
};

// Get active popup image
const getActivePopupImage = async (req, res) => {
    try {
        const popupImage = await PopupImage.findOne({ isActive: true });
        res.json({ popupImage });
    } catch (error) {
        console.error('Error getting popup image:', error);
        res.status(500).json({ message: 'Error getting popup image' });
    }
};

// Get all popup images (admin)
const getAllPopupImages = async (req, res) => {
    try {
        console.log('Get all popup images request received');
        console.log('Admin user:', req.admin);

        const popupImages = await PopupImage.find().sort({ createdAt: -1 });
        res.json({ popupImages });
    } catch (error) {
        console.error('Error getting popup images:', error);
        res.status(500).json({ message: 'Error getting popup images' });
    }
};

// Update popup image
const updatePopupImage = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            title: req.body.title,
            description: req.body.description,
            updatedAt: Date.now()
        };

        if (req.file) {
            // Upload new image to cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'popup-images',
                width: 800,
                height: 600,
                crop: 'fill'
            });
            updateData.imageUrl = result.secure_url;
        }

        const popupImage = await PopupImage.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!popupImage) {
            return res.status(404).json({ message: 'Popup image not found' });
        }

        res.json({
            message: 'Popup image updated successfully',
            popupImage
        });
    } catch (error) {
        console.error('Error updating popup image:', error);
        res.status(500).json({ message: 'Error updating popup image' });
    }
};

// Delete popup image
const deletePopupImage = async (req, res) => {
    try {
        const { id } = req.params;
        const popupImage = await PopupImage.findByIdAndDelete(id);

        if (!popupImage) {
            return res.status(404).json({ message: 'Popup image not found' });
        }

        res.json({ message: 'Popup image deleted successfully' });
    } catch (error) {
        console.error('Error deleting popup image:', error);
        res.status(500).json({ message: 'Error deleting popup image' });
    }
};

// Toggle popup image active status
const togglePopupImageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const popupImage = await PopupImage.findById(id);

        if (!popupImage) {
            return res.status(404).json({ message: 'Popup image not found' });
        }

        // If activating this image, deactivate all others
        if (!popupImage.isActive) {
            await PopupImage.updateMany({}, { isActive: false });
        }

        popupImage.isActive = !popupImage.isActive;
        popupImage.updatedAt = Date.now();
        await popupImage.save();

        res.json({
            message: 'Popup image status updated successfully',
            popupImage
        });
    } catch (error) {
        console.error('Error toggling popup image status:', error);
        res.status(500).json({ message: 'Error updating popup image status' });
    }
};

module.exports = {
    uploadPopupImage,
    getActivePopupImage,
    getAllPopupImages,
    updatePopupImage,
    deletePopupImage,
    togglePopupImageStatus
};
