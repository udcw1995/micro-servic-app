'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authenticate = require('../middleware/authenticate');
const { UploadController, clearExistingAvatar } = require('../controllers/UploadController');

const router = express.Router();

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    // An admin may pass ?userId=<target> to upload on behalf of another user.
    // Fall back to the authenticated user's own ID.
    const targetUserId = req.query.userId || req.user.userId;
    const filename = `avatar-${targetUserId}${ext}`;
    // Remove any existing avatar (different extension) before writing the new one
    clearExistingAvatar(targetUserId);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Only image files are allowed (jpeg, png, gif, webp)'), { statusCode: 415 }));
    }
  },
});

// POST /api/uploads/avatar
router.post('/avatar', authenticate, upload.single('avatar'), UploadController.uploadAvatar.bind(UploadController));

// DELETE /api/uploads/avatar
router.delete('/avatar', authenticate, UploadController.deleteAvatar.bind(UploadController));

// Multer / general error handler for this router
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 5 MB.' });
  }
  return res.status(err.statusCode || 400).json({ error: err.message });
});

module.exports = router;
