const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderDetails, 
  getAllOrders, 
  updateOrderStatus 
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { body } = require('express-validator');

// All order routes require authentication
router.use(auth);

// Create a new order from cart
router.post('/', createOrder);

// Get user's orders
router.get('/', getUserOrders);

// Get order details
router.get('/:id', getOrderDetails);

// Get all orders (admin only)
router.get('/all', admin, getAllOrders);

// Update order status (admin only)
router.put('/:id/status', [
  admin,
  // Validation rules
  body('status')
    .isIn(['pending', 'processing', 'completed', 'cancelled'])
    .withMessage('Status must be pending, processing, completed, or cancelled')
], updateOrderStatus);

module.exports = router;
