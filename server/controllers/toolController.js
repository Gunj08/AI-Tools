const Tool = require('../models/Tool');
const Category = require('../models/Category');
const slugify = require('slugify');
const { Op } = require('sequelize');

// @desc    Get all tools (with filters, search, sorting & pagination)
// @route   GET /api/tools
// @access  Public (or Admin if admin query param is passed)
exports.getTools = async (req, res) => {
  try {
    const { category, pricing, search, sort, page, limit, adminMode, approved } = req.query;

    const query = {};

    // For public, show only approved tools. For admins, show based on filters
    if (adminMode === 'true') {
      if (approved === 'true') query.approved = true;
      else if (approved === 'false') query.approved = false;
      // if not specified, return all for admins
    } else {
      query.approved = true;
    }

    // Category Filter (Can be Category ID or Category Slug)
    if (category) {
      if (!isNaN(category)) {
        query.categoryId = parseInt(category, 10);
      } else {
        const foundCategory = await Category.findOne({ where: { slug: category } });
        if (foundCategory) {
          query.categoryId = foundCategory.id;
        } else {
          return res.json({ success: true, count: 0, total: 0, pages: 0, data: [] });
        }
      }
    }

    // Pricing Filter
    if (pricing) {
      const pricingArray = pricing.split(',');
      query.pricing = { [Op.in]: pricingArray };
    }

    // Text Search Filter
    if (search) {
      const searchVal = `%${search}%`;
      query[Op.or] = [
        { name: { [Op.like]: searchVal } },
        { shortDesc: { [Op.like]: searchVal } },
        { description: { [Op.like]: searchVal } },
        { tags: { [Op.like]: searchVal } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offsetNum = (pageNum - 1) * limitNum;

    // Sorting
    let orderQuery = [];
    if (sort === 'rating') {
      orderQuery = [['rating', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'votes') {
      orderQuery = [['votes', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'newest') {
      orderQuery = [['createdAt', 'DESC']];
    } else if (sort === 'alphabetical') {
      orderQuery = [['name', 'ASC']];
    } else {
      // Default: featured first, then by rating
      orderQuery = [['featured', 'DESC'], ['rating', 'DESC'], ['createdAt', 'DESC']];
    }

    // Execute queries
    const { count, rows } = await Tool.findAndCountAll({
      where: query,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon', 'color'] }],
      order: orderQuery,
      limit: limitNum,
      offset: offsetNum
    });

    return res.json({
      success: true,
      count: rows.length,
      total: count,
      pages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: rows
    });
  } catch (error) {
    console.error('GetTools Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single tool by slug
// @route   GET /api/tools/:slug
// @access  Public
exports.getToolBySlug = async (req, res) => {
  try {
    const tool = await Tool.findOne({
      where: { slug: req.params.slug },
      include: [{ model: Category, as: 'category' }]
    });

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    // Fetch related tools (same category, excluding current tool, limit to 4)
    const related = await Tool.findAll({
      where: {
        categoryId: tool.categoryId,
        id: { [Op.ne]: tool.id },
        approved: true
      },
      include: [{ model: Category, as: 'category' }],
      limit: 4
    });

    return res.json({
      success: true,
      data: tool,
      related
    });
  } catch (error) {
    console.error('GetToolBySlug Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create/Submit a tool
// @route   POST /api/tools
// @access  Public (unapproved by default) or Admin (can auto-approve)
exports.createTool = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDesc,
      category, // category ID (foreign key)
      tags,
      websiteUrl,
      logoUrl,
      pricing,
      rating,
      featured,
      approved
    } = req.body;

    if (!name || !description || !shortDesc || !category || !websiteUrl) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const slug = slugify(name, { lower: true, strict: true });

    // Check if tool name exists
    const toolExists = await Tool.findOne({ where: { slug } });
    if (toolExists) {
      return res.status(400).json({ success: false, message: 'An AI tool with this name already exists' });
    }

    // Verify category exists
    const categoryExists = await Category.findByPk(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'Selected Category does not exist' });
    }

    // Admin user can pre-approve and feature tools
    const isAdmin = req.user && req.user.role === 'admin';

    const tagsArray = Array.isArray(tags) 
      ? tags 
      : (tags ? tags.split(',').map(t => t.trim()) : []);

    const tool = await Tool.create({
      name,
      slug,
      description,
      shortDesc,
      categoryId: parseInt(category, 10),
      tags: tagsArray,
      websiteUrl,
      logoUrl: logoUrl || '',
      pricing: pricing || 'Freemium',
      rating: rating ? parseFloat(rating) : 0.0,
      featured: isAdmin ? (featured === true || featured === 'true') : false,
      approved: isAdmin ? (approved === true || approved === 'true') : false,
      userId: req.user ? req.user.id : null
    });

    return res.status(201).json({
      success: true,
      message: tool.approved ? 'Tool created successfully' : 'Tool submitted successfully and is pending review!',
      data: tool
    });
  } catch (error) {
    console.error('CreateTool Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a tool
// @route   PUT /api/tools/:id
// @access  Private/Admin
exports.updateTool = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDesc,
      category,
      tags,
      websiteUrl,
      logoUrl,
      pricing,
      rating,
      featured,
      approved
    } = req.body;

    let tool = await Tool.findByPk(req.params.id);

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    const updateFields = {
      description,
      shortDesc,
      websiteUrl,
      logoUrl,
      pricing,
      rating: parseFloat(rating) || 0,
      featured: featured === true || featured === 'true',
      approved: approved === true || approved === 'true'
    };

    if (name && name !== tool.name) {
      updateFields.name = name;
      updateFields.slug = slugify(name, { lower: true, strict: true });
    }

    if (category) {
      const categoryExists = await Category.findByPk(category);
      if (!categoryExists) {
        return res.status(404).json({ success: false, message: 'Selected Category does not exist' });
      }
      updateFields.categoryId = parseInt(category, 10);
    }

    if (tags) {
      updateFields.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    await tool.update(updateFields);

    return res.json({ success: true, message: 'Tool updated successfully', data: tool });
  } catch (error) {
    console.error('UpdateTool Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a tool
// @route   DELETE /api/tools/:id
// @access  Private/Admin
exports.deleteTool = async (req, res) => {
  try {
    const tool = await Tool.findByPk(req.params.id);

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    await tool.destroy();

    return res.json({ success: true, message: 'Tool deleted successfully' });
  } catch (error) {
    console.error('DeleteTool Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject a tool submission
// @route   PUT /api/tools/:id/approve
// @access  Private/Admin
exports.approveTool = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const tool = await Tool.findByPk(req.params.id);

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    if (action === 'approve') {
      tool.approved = true;
      await tool.save();

      // Send notification if user submitted it
      if (tool.userId) {
        try {
          const Notification = require('../models/Notification');
          await Notification.create({
            userId: tool.userId,
            title: 'AI Tool Approved! 🎉',
            message: `Your suggested tool "${tool.name}" has been approved and published to the directory!`
          });
        } catch (err) {
          console.error('Failed to create notification on approval:', err);
        }
      }

      return res.json({ success: true, message: 'Tool approved successfully', data: tool });
    } else {
      await tool.destroy();
      return res.json({ success: true, message: 'Tool submission rejected and deleted' });
    }
  } catch (error) {
    console.error('ApproveTool Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upvote a tool
// @route   POST /api/tools/:id/upvote
// @access  Public
exports.upvoteTool = async (req, res) => {
  try {
    const tool = await Tool.findByPk(req.params.id);

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    tool.votes += 1;
    await tool.save();

    return res.json({ success: true, votes: tool.votes });
  } catch (error) {
    console.error('UpvoteTool Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle featured status
// @route   PUT /api/tools/:id/featured
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const tool = await Tool.findByPk(req.params.id);

    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }

    tool.featured = !tool.featured;
    await tool.save();

    return res.json({ success: true, featured: tool.featured, data: tool });
  } catch (error) {
    console.error('ToggleFeatured Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tools/stats/dashboard
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const totalTools = await Tool.count({ where: { approved: true } });
    const pendingSubmissions = await Tool.count({ where: { approved: false } });
    const totalCategories = await Category.count();
    const featuredTools = await Tool.count({ where: { featured: true, approved: true } });

    // Recent submissions
    const recentSubmissions = await Tool.findAll({
      where: { approved: false },
      include: [{ model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    return res.json({
      success: true,
      stats: {
        totalTools,
        pendingSubmissions,
        totalCategories,
        featuredTools
      },
      recentSubmissions
    });
  } catch (error) {
    console.error('GetStats Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user submissions
// @route   GET /api/tools/my-submissions
// @access  Private
exports.getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await Tool.findAll({
      where: { userId },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('GetMySubmissions Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
