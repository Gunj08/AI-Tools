const express = require('express');
const router = express.Router();
const { login, register, getMe, updateProfile, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;

