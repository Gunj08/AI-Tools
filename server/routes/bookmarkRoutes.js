const express = require('express');
const router = express.Router();
const { toggleBookmark, getBookmarks } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All bookmark routes require authentication

router.route('/')
  .get(getBookmarks)
  .post(toggleBookmark);

module.exports = router;
