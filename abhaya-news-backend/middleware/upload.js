const multer = require('multer');
const path = require('path');

// 1. Define storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');              // Folder where files will be saved
  },
  filename: (req, file, cb) => {
    // e.g., news-1632342342343.jpg
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, 'news-' + uniqueSuffix);
  }
});

// 2. File filter to accept images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images are allowed'));
};

// 3. Export the Multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 2 MB max
  fileFilter
});

module.exports = upload;
