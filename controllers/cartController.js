const Cart = require('../models/Cart');
const { validationResult } = require('express-validator');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.getByUserId(req.user.id);
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error retrieving cart' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity = 1 } = req.body;
    
    // Get user's cart
    const cart = await Cart.getByUserId(req.user.id);
    
    // Add item to cart
    const updatedCart = await cart.addItem(parseInt(productId), parseInt(quantity));
    
    res.json({
      message: 'Item added to cart',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error adding item to cart' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
    
    // Get user's cart
    const cart = await Cart.getByUserId(req.user.id);
    
    // Update item quantity
    const updatedCart = await cart.updateItemQuantity(productId, parseInt(quantity));
    
    res.json({
      message: 'Cart updated',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Get user's cart
    const cart = await Cart.getByUserId(req.user.id);
    
    // Remove item from cart
    const updatedCart = await cart.removeItem(productId);
    
    res.json({
      message: 'Item removed from cart',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ message: 'Server error removing item from cart' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.getByUserId(req.user.id);
    
    // Clear cart
    const updatedCart = await cart.clear();
    
    res.json({
      message: 'Cart cleared',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};
