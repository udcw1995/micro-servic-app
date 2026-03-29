'use strict';

const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

function clearExistingAvatar(userId) {
  if (!fs.existsSync(UPLOADS_DIR)) return;
  const files = fs.readdirSync(UPLOADS_DIR);
  for (const file of files) {
    if (file.startsWith(`avatar-${userId}.`)) {
      fs.unlinkSync(path.join(UPLOADS_DIR, file));
    }
  }
}

class UploadController {
  uploadAvatar(req, res) {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `/api/uploads/file/${req.file.filename}`;
    return res.status(200).json({ url, filename: req.file.filename });
  }

  deleteAvatar(req, res) {
    try {
      clearExistingAvatar(req.user.userId);
      return res.status(200).json({ message: 'Avatar deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = { UploadController: new UploadController(), clearExistingAvatar };
