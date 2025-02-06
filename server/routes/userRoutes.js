const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import user controller
const {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUser
} = require('../controllers/userController');

// User routes
router.route('/profile', protect, authorize, updateUserProfile);

// Admin only routes
router.route('/')
    .get(protect, authorize(['admin']), getAllUsers);

router.route('/:id')
    .delete(protect, authorize(['admin']), deleteUser);

module.exports = router;