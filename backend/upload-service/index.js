'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');

const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 3002;
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');

// Ensure uploads directory exists at startup
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(express.json());

// Serve uploaded files as static assets (public — no auth needed to view images)
app.use('/api/uploads/file', express.static(UPLOADS_DIR));

// Upload management routes (authenticated)
app.use('/api/uploads', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Upload service listening on port ${PORT}`);
  console.log(`Files stored in: ${UPLOADS_DIR}`);
});
