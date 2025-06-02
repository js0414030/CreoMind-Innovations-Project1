const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

// POST - Upload video data
router.post('/', async (req, res) => {
    try {
        // const { title, link, category, description } = req.body;
        // const video = new Video({ title, link, category, description });
        const { title, videoUrl, category, description } = req.body;
        const video = new Video({ title, link: videoUrl, category, description });
        await video.save();
        res.status(201).json({ message: 'Video uploaded successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading video.', error: error.message });
    }
});

// GET - Fetch all videos
// router.get('/', async (req, res) => {
//     try {
//         const videos = await Video.find().sort({ createdAt: -1 });
//         res.status(200).json(videos);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching videos.', error: error.message });
//     }
// });

// GET - Paginated video fetch
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const total = await Video.countDocuments();
        const videos = await Video.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            videos,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching videos', error: error.message });
    }
});

// GET - Single video by ID (for edit modal)
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching video details', error: error.message });
    }
});

// PUT - Update video by ID
router.put('/:id', async (req, res) => {
    try {
        const { title, videoUrl, category, description } = req.body;
        const updatedVideo = await Video.findByIdAndUpdate(
            req.params.id,
            {
                title,
                link: videoUrl, // mapped to schema
                category,
                description
            },
            { new: true }
        );
        if (!updatedVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.json({ message: 'Video updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating video', error: error.message });
    }
});

// DELETE - Remove video by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedVideo = await Video.findByIdAndDelete(req.params.id);
        if (!deletedVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting video', error: error.message });
    }
});


module.exports = router;
