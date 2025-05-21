const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { validationResult } = require('express-validator');

// Create a new order from cart
exports.createOrder = async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.getByUserId(req.user.id);
    
    if (cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Get delivery date from request body if provided
    const { delivery_date } = req.body;
    
    // Create order from cart
    const orderId = await cart.checkout(delivery_date);
    
    // Get the created order
    const order = await Order.getById(orderId);
    
    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.getAll(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error retrieving orders' });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the requesting user or if user is admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error retrieving order' });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error retrieving orders' });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    
    // Check if order exists
    const existingOrder = await Order.getById(req.params.id);
    
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = new Order({
      id: parseInt(req.params.id),
      status
    });
    
    const updated = await order.updateStatus();
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update order status' });
    }
    
    // Get the updated order
    const updatedOrder = await Order.getById(req.params.id);
    
    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

// Update order delivery date (admin only)
exports.updateDeliveryDate = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { delivery_date } = req.body;
    
    // Check if order exists
    const existingOrder = await Order.getById(req.params.id);
    
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = new Order({
      id: parseInt(req.params.id),
      delivery_date
    });
    
    const updated = await order.updateDeliveryDate();
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update delivery date' });
    }
    
    // Get the updated order
    const updatedOrder = await Order.getById(req.params.id);
    
    res.json({
      message: 'Order delivery date updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update delivery date error:', error);
    res.status(500).json({ message: 'Server error updating delivery date' });
  }
};
