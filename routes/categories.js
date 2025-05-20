const express = require('express');
const router = express.Router();
const { 
  getAllCategories, 
  getCategoryById, 
  getProductsByCategory,
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { body } = require('express-validator');

// Get all categories
router.get('/', getAllCategories);

// Get category by ID
router.get('/:id', getCategoryById);

// Get products by category
router.get('/:id/products', getProductsByCategory);

// Create a new category (admin only)
router.post('/', [
  auth, 
  admin,
  // Validation rules
  body('name').notEmpty().withMessage('Category name is required')
], createCategory);

// Update a category (admin only)
router.put('/:id', [
  auth, 
  admin,
  // Validation rules
  body('name').notEmpty().withMessage('Category name is required')
], updateCategory);

// Delete a category (admin only)
router.delete('/:id', [auth, admin], deleteCategory);

module.exports = router;
