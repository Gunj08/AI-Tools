const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { connectDB, sequelize } = require('./config/db');
require('dotenv').config();

// Initialize app
const app = express();

// Connect & Sync Database
connectDB();
// Load models to register schemas for sync
require('./models/User');
require('./models/Category');
require('./models/Tool');
require('./models/Bookmark');
require('./models/Review');
require('./models/Notification');

sequelize.sync()
  .then(() => console.log('Sequelize Tables Synced.'))
  .catch(err => console.error('Sequelize Sync Error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Local image uploads setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png, gif, webp)'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Serve upload directory statically
app.use('/uploads', express.static(uploadDir));

// Image Upload Endpoint (Public or Admin)
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/tools', require('./routes/toolRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
