const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const multer = require('multer');
const path = require('path');


// Load environment variables first
dotenv.config();

// Initialize Express app
const app = express();

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public'))); // means: "if someone visits /news.html, serve the file from public/news.html."


// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON body
app.use('/uploads', express.static('uploads'));
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Image too large. Max size is 2 MB.' });
    }
    // handle other Multer errors here
    return res.status(400).json({ message: err.message });
  }
  // if not a Multer error, pass on to default Express error handler
  next(err);
});

// Database connection
connectDB();

// Routes
const adminRoutes = require('./routes/adminRoutes');
const newsRoutes = require('./routes/newsRoutes');
const videoRoutes = require('./routes/videoRoutes');
const popupRoutes = require('./routes/popupRoutes');
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/youtube', videoRoutes);
app.use('/api', popupRoutes);


// // Basic route
// app.get('/', (req, res) => {
//   res.send('Welcome to ABHAYA News Backend!');
// });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'news.html'));
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port http://localhost:5000`));



