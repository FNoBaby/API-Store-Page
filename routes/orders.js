const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderDetails, 
  getAllOrders, 
  updateOrderStatus,
  updateDeliveryDate
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

// Get all orders (admin only)
router.get('/all', admin, getAllOrders);

// Get order details
router.get('/:id', getOrderDetails);

// Update order status (admin only)
router.put('/:id/status', [
  admin,
  // Validation rules
  body('status')
    .isIn(['pending', 'processing', 'completed', 'cancelled'])
    .withMessage('Status must be pending, processing, completed, or cancelled')
], updateOrderStatus);

// Update order delivery date (admin only)
router.put('/:id/delivery-date', [
  admin,
  // Validation rules
  body('delivery_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Delivery date must be in ISO 8601 format (YYYY-MM-DD)')
], updateDeliveryDate);

module.exports = router;
