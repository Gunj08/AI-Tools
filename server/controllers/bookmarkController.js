const Bookmark = require('../models/Bookmark');
const Tool = require('../models/Tool');
const Category = require('../models/Category');

// @desc    Toggle bookmark for a tool
// @route   POST /api/bookmarks
// @access  Private
exports.toggleBookmark = async (req, res) => {
  try {
    const { toolId } = req.body;
    const userId = req.user.id;

    if (!toolId) {
      return res.status(400).json({ success: false, message: 'Tool ID is required' });
    }

    // Check if tool exists
    const tool = await Tool.findByPk(toolId);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({ where: { userId, toolId } });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, isBookmarked: false, message: 'Bookmark removed' });
    } else {
      await Bookmark.create({ userId, toolId });
      return res.json({ success: true, isBookmarked: true, message: 'Bookmark added successfully' });
    }
  } catch (error) {
    console.error('ToggleBookmark Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookmarks for logged-in user
// @route   GET /api/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarks = await Bookmark.findAll({
      where: { userId },
      include: [
        {
          model: Tool,
          as: 'tool',
          include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon', 'color'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const tools = bookmarks.map(b => b.tool).filter(t => t !== null);

    return res.json({
      success: true,
      count: tools.length,
      data: tools
    });
  } catch (error) {
    console.error('GetBookmarks Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
