const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecure_aitools_key_987654321', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user (force 'user' role to prevent admin registration)
    const user = await User.create({
      username,
      email,
      password,
      role: 'user'
    });

    return res.status(201).json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, avatar, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (username) user.username = username;
    
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
      user.email = email;
    }

    if (avatar) user.avatar = avatar;

    if (password) {
      user.password = password; // Will be hashed in beforeSave hook
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mock Google Login / Register
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { email, username, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Determine role: if it matches the owner's email, assign 'admin', else 'user'
    const role = email === 'admin@example.com' ? 'admin' : 'user';

    // Check if user already exists
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create user with dummy password
      const dummyPassword = Math.random().toString(36).slice(-8) + 'A1!';
      user = await User.create({
        username: username || email.split('@')[0],
        email,
        password: dummyPassword,
        role,
        avatar: avatar || ''
      });
    } else {
      // If the user role should be updated (e.g. they registered normally and are logging in with Google now)
      if (user.role !== role) {
        user.role = role;
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

