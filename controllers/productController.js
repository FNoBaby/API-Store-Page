const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Get all products with optional search/filter
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const products = await Product.getAll(search, category);
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error retrieving products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error retrieving product' });
  }
};

// Get random products
exports.getRandomProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const products = await Product.getRandomProducts(limit);
    res.json(products);
  } catch (error) {
    console.error('Get random products error:', error);
    res.status(500).json({ message: 'Server error retrieving random products' });
  }
};

// Create a new product (admin only)
exports.createProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category_id, active, featured } = req.body;
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category_id: parseInt(category_id),
      image: req.file ? req.file.filename : 'default-product.png',
      active: active === 'true' || active === '1' ? 1 : 0,
      featured: featured === 'true' || featured === '1' ? 1 : 0
    });
    
    const productId = await product.create();
    
    // Get the created product
    const createdProduct = await Product.getById(productId);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: createdProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// Update a product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category_id, active, featured } = req.body;
    
    // Check if product exists
    const existingProduct = await Product.getById(req.params.id);
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = new Product({
      id: parseInt(req.params.id),
      name,
      description,
      price: parseFloat(price),
      category_id: parseInt(category_id),
      image: req.file ? req.file.filename : null, // Only update image if file provided
      active: active === 'true' || active === '1' ? 1 : 0,
      featured: featured === 'true' || featured === '1' ? 1 : 0
    });
    
    const updated = await product.update();
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update product' });
    }
    
    // Get the updated product
    const updatedProduct = await Product.getById(req.params.id);
    
    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// Delete a product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    // Check if product exists
    const existingProduct = await Product.getById(req.params.id);
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = new Product({
      id: parseInt(req.params.id)
    });
    
    const deleted = await product.delete();
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete product' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};
