const Review = require('../models/Review');
const Tool = require('../models/Tool');
const User = require('../models/User');

// Helper function to update tool rating
const updateToolRating = async (toolId) => {
  const reviews = await Review.findAll({ where: { toolId } });
  if (reviews.length === 0) {
    await Tool.update({ rating: 0.0 }, { where: { id: toolId } });
    return;
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = parseFloat((sum / reviews.length).toFixed(1));
  await Tool.update({ rating: avg }, { where: { id: toolId } });
};

// @desc    Create or update review for a tool
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { toolId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!toolId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Tool ID, rating (1-5), and comment are required' });
    }

    const ratingVal = parseInt(rating, 10);
    if (ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if tool exists
    const tool = await Tool.findByPk(toolId);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    // Check if user already reviewed
    let review = await Review.findOne({ where: { userId, toolId } });

    if (review) {
      review.rating = ratingVal;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({ userId, toolId, rating: ratingVal, comment });
    }

    // Recalculate average rating of the tool
    await updateToolRating(toolId);

    return res.status(201).json({
      success: true,
      message: 'Review saved successfully',
      data: review
    });
  } catch (error) {
    console.error('CreateReview Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user reviews
// @route   GET /api/reviews
// @access  Private
exports.getReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: Tool,
          as: 'tool',
          attributes: ['id', 'name', 'slug', 'logoUrl']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('GetReviews Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Verify ownership
    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    const toolId = review.toolId;
    await review.destroy();

    // Recalculate average rating of the tool
    await updateToolRating(toolId);

    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('DeleteReview Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a specific tool
// @route   GET /api/reviews/tool/:toolId
// @access  Public
exports.getToolReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { toolId: req.params.toolId },
      include: [{ model: User, as: 'user', attributes: ['username', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('GetToolReviews Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
