const express = require('express');
const router = express.Router();
const {
  getTools,
  getToolBySlug,
  createTool,
  updateTool,
  deleteTool,
  approveTool,
  upvoteTool,
  toggleFeatured,
  getStats,
  getMySubmissions
} = require('../controllers/toolController');
const { protect, optionalProtect, admin } = require('../middleware/authMiddleware');

// Dashboard statistics (Admin only) - MUST BE BEFORE slug route
router.get('/stats/dashboard', protect, admin, getStats);

// Get logged-in user submissions - MUST BE BEFORE slug route
router.get('/my-submissions', protect, getMySubmissions);

router.route('/')
  .get(optionalProtect, getTools)
  .post(optionalProtect, createTool);

router.route('/:slug')
  .get(getToolBySlug);

router.route('/:id')
  .put(protect, admin, updateTool)
  .delete(protect, admin, deleteTool);

router.put('/:id/approve', protect, admin, approveTool);
router.put('/:id/featured', protect, admin, toggleFeatured);
router.post('/:id/upvote', upvoteTool);

module.exports = router;
