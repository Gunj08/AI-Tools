const express = require('express');
const router = express.Router();
const { createReview, getReviews, deleteReview, getToolReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public route to view reviews of a tool
router.get('/tool/:toolId', getToolReviews);

// Protected routes for managing reviews
router.route('/')
  .get(protect, getReviews)
  .post(protect, createReview);

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;
