const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { UPLOADS_DIR } = require('../services/storageService');

// Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const hash = crypto.randomBytes(8).toString('hex');
    cb(null, `evidence_${Date.now()}_${hash}${ext}`);
  },
});

// File filter (Allow all valid image MIME types and extensions)
const fileFilter = (req, file, cb) => {
  const isImageMime = file.mimetype && file.mimetype.toLowerCase().startsWith('image/');
  const isImageExt = /\.(jpg|jpeg|png|webp|gif|svg|bmp|heic|heif|avif|jfif)$/i.test(file.originalname || '');
  if (isImageMime || isImageExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, PNG, WEBP, GIF, etc.) are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

/**
 * POST /api/upload
 * Multi-part image upload endpoint for complaint evidence and resolution proof
 */
router.post('/', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided in request (field name must be "photo").' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// Multer error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds maximum allowed limit of 10MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
