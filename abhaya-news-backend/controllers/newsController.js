const News = require('../models/News');
const path = require('path');

// POST /api/news/upload
const uploadNews = async (req, res) => {
  const { title, body, category,imageUrl } = req.body;

  
  try {
    const imageUrl = req.file ? req.file.path : null; // Cloudinary returns full URL in req.file.path
    const news = new News({ title, body, category, imageUrl });
    await news.save();
    res.status(201).json({ message: "News uploaded", news });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  
};



// PUT /api/news/:id
const updateNews = async (req, res) => {
  const { title, body, category } = req.body;

  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    news.title = title || news.title;
    news.body = body || news.body;
    news.category = category || news.category;

    if (req.file) {
      news.imageUrl = req.file.path; // Cloudinary full image URL
    }

    const updatedNews = await news.save();
    res.status(200).json({ message: "News updated", updatedNews });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// GET all news with pagination and optional category filter
const getAllNews = async (req, res) => {
    const { page = 1, limit = 10, category } = req.query;

    const filter = category ? { category } : {};

    try {
        const news = await News.find(filter)
            .sort({ createdAt: -1 }) // Latest first
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await News.countDocuments(filter);

        res.status(200).json({
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            news
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET single news by ID
const getNewsById = async (req, res) => {
    const { id } = req.params;

    try {
        const news = await News.findById(id);
        if (!news) return res.status(404).json({ message: "News not found" });

        res.status(200).json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// DELETE /api/news/:id
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found' });

    await news.deleteOne();
    res.status(200).json({ message: 'News deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
    uploadNews,
    getAllNews,
    getNewsById,
    updateNews,
    deleteNews,
};

