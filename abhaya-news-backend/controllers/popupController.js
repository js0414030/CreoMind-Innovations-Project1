const PopupNews = require('../models/PopupNews');
const cloudinary = require('../config/cloudinary');

// -------------------------------
// Get all popup news
// -------------------------------
const getAllPopupNews = async (req, res) => {
    try {
        const news = await PopupNews.find().sort({ createdAt: -1 });
        res.json(news);
    } catch (error) {
        console.error('Error fetching popup news:', error);
        res.status(500).json({ message: 'Error fetching popup news' });
    }
};

// -------------------------------
// Get active popup news
// -------------------------------
const getActivePopupNews = async (req, res) => {
    try {
        const active = await PopupNews.findOne({ isActive: true });
        res.json(active);
    } catch (error) {
        console.error('Error fetching active popup news:', error);
        res.status(500).json({ message: 'Error fetching active popup news' });
    }
};

// -------------------------------
// Create popup news
// -------------------------------
const createPopupNews = async (req, res) => {
    try {
        if (req.body.isActive) {
            await PopupNews.updateMany({}, { isActive: false });
        }

        const news = new PopupNews({
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await news.save();
        res.status(201).json(news);
    } catch (error) {
        console.error('Error creating popup news:', error);
        res.status(500).json({ message: 'Error creating popup news' });
    }
};

// -------------------------------
// Update popup news
// -------------------------------
const updatePopupNews = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.body.isActive) {
            await PopupNews.updateMany({}, { isActive: false });
        }

        const news = await PopupNews.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );

        res.json(news);
    } catch (error) {
        console.error('Error updating popup news:', error);
        res.status(500).json({ message: 'Error updating popup news' });
    }
};

// -------------------------------
// Delete popup news
// -------------------------------
const deletePopupNews = async (req, res) => {
    try {
        const { id } = req.params;
        await PopupNews.findByIdAndDelete(id);
        res.json({ message: 'Popup news deleted' });
    } catch (error) {
        console.error('Error deleting popup news:', error);
        res.status(500).json({ message: 'Error deleting popup news' });
    }
};

// -------------------------------
// Activate popup news (set one active, deactivate others)
// -------------------------------
const activatePopupNews = async (req, res) => {
    try {
        const { id } = req.params;

        await PopupNews.updateMany({}, { isActive: false });
        const active = await PopupNews.findByIdAndUpdate(
            id,
            { isActive: true, updatedAt: new Date() },
            { new: true }
        );

        res.json(active);
    } catch (error) {
        console.error('Error activating popup news:', error);
        res.status(500).json({ message: 'Error activating popup news' });
    }
};

// -------------------------------
// Upload image for popup news
// -------------------------------
const uploadPopupNewsImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'popup-news-images',
            width: 800,
            height: 400,
            crop: 'fill'
        });

        res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
        console.error('Error uploading popup news image:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
};

module.exports = {
    getAllPopupNews,
    getActivePopupNews,
    createPopupNews,
    updatePopupNews,
    deletePopupNews,
    activatePopupNews,
    uploadPopupNewsImage
};
