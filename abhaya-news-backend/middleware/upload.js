const multer = require('multer');
const path = require('path');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'abhaya-news', // Cloud folder name
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  }
});

// 2. File filter to accept images only
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|gif/;
//   const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mime = allowedTypes.test(file.mimetype);
//   if (ext && mime) cb(null, true);
//   else cb(new Error('Only images are allowed'));
// };

// 3. Export the Multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5 MB max
  // fileFilter
});

module.exports = upload;
