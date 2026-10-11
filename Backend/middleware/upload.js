const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (Cloudinary will handle the actual storage)
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const extname = /^\.(jpe?g|png|gif|webp)$/.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  const err = new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)');
  err.statusCode = 400;
  cb(err);
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
