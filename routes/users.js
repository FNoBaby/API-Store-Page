const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  updateProfile, 
  updatePassword, 
  deleteAccount 
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');
const { body } = require('express-validator');

// Get all users (admin only)
router.get('/', [auth, admin], getAllUsers);

// Get user by ID (admin only)
router.get('/:id', [auth, admin], getUserById);

// Update user profile
router.put('/profile', [
  auth,
  upload.single('profileImage'),
  // Validation rules
  body('name').notEmpty().withMessage('Name is required'),
  body('surname').notEmpty().withMessage('Surname is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required')
], updateProfile);

// Update user password
router.put('/password', [
  auth,
  // Validation rules
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], updatePassword);

// Delete user account
router.delete('/', auth, deleteAccount);

module.exports = router;
