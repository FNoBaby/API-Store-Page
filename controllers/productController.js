const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const { DEFAULT_PRODUCT_FILENAME } = require('../utils/constants');
const { getProductImageUrl } = require('../utils/helpers');

// Get all products with optional search/filter
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const products = await Product.getAll(search, category);
    
    // Format products data with proper image URLs
    const formattedProducts = products.map(product => {
      // Generate an image filename based on the product ID
      const productImage = `product_${product.id}.jpg`;
      
      return {
        ...product,
        image: getProductImageUrl(req, productImage)
      };
    });
    
    res.json(formattedProducts);
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
    
    // Generate an image filename based on the product ID
    const productImage = `product_${product.id}.jpg`;
    
    // Format product data with proper image URL
    const formattedProduct = {
      ...product,
      image: getProductImageUrl(req, productImage)
    };
      res.json(formattedProduct);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error retrieving product' });
  }
};

// Get product image by ID
exports.getProductImage = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Generate the image filename based on the product ID
    const productImageFilename = `product_${product.id}.jpg`;
    const imagePath = `${process.cwd()}/uploads/products/${productImageFilename}`;
    const defaultPath = `${process.cwd()}/uploads/${DEFAULT_PRODUCT_FILENAME}`;
    
    // Check if the image file exists
    const fs = require('fs');
    if (fs.existsSync(imagePath)) {
      // Add CORS headers for the image
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.sendFile(imagePath);
    } else {
      // If the product image doesn't exist, serve the default image
      return res.sendFile(defaultPath);
    }
  } catch (error) {
    console.error('Get product image error:', error);
    res.status(500).json({ message: 'Server error retrieving product image' });
  }
};

// Get random products
exports.getRandomProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const products = await Product.getRandomProducts(limit);
    
    // Format products data with proper image URLs
    const formattedProducts = products.map(product => {
      // Generate an image filename based on the product ID
      const productImage = `product_${product.id}.jpg`;
      
      return {
        ...product,
        image: getProductImageUrl(req, productImage)
      };
    });
    
    res.json(formattedProducts);
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
    }    const { name, description, price, category_id, active, featured } = req.body;
    
    // Handle product image
    let image = DEFAULT_PRODUCT_FILENAME; // Default image
    if (req.file) {
      image = req.file.filename;
      console.log(`Product image uploaded: ${image}`);
    } else {
      console.log('Using default product image');
    }
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category_id: parseInt(category_id),
      image: image,
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
      // Handle product image
    let image = existingProduct.image; // Default to keeping the existing image
    if (req.file) {
      image = req.file.filename;
      console.log(`Updated product image: ${image}`);
    }
    
    const product = new Product({
      id: parseInt(req.params.id),
      name,
      description,
      price: parseFloat(price),
      category_id: parseInt(category_id),
      image: image, // Use existing image if no new file uploaded
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
