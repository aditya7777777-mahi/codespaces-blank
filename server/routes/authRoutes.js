const express = require('express');
const { register, login, isAuthenticated } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/check', protect, isAuthenticated);

// Register route with conditional protection
router.post('/register', async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return protect(req, res, next);
  }
  next();
}, register);

module.exports = router;
