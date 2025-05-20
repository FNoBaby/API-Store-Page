const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart 
} = require('../controllers/cartController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

// All cart routes require authentication
router.use(auth);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/', [
  // Validation rules
  body('productId').isNumeric().withMessage('Product ID must be a number'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], addToCart);

// Update cart item quantity
router.put('/:productId', [
  // Validation rules
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater')
], updateCartItem);

// Remove item from cart
router.delete('/:productId', removeCartItem);

// Clear cart
router.delete('/', clearCart);

module.exports = router;
