const Category = require('../models/Category');
const slugify = require('slugify');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    return res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    console.error('GetCategories Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const slug = slugify(name, { lower: true, strict: true });

    // Check if category exists
    const categoryExists = await Category.findOne({ where: { slug } });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category with similar name already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      icon,
      description,
      color
    });

    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('CreateCategory Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, description, color } = req.body;
    let category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updateFields = { icon, description, color };
    if (name) {
      updateFields.name = name;
      updateFields.slug = slugify(name, { lower: true, strict: true });
    }

    await category.update(updateFields);

    return res.json({ success: true, data: category });
  } catch (error) {
    console.error('UpdateCategory Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.destroy();

    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('DeleteCategory Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
