const Category = require('../models/Category');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error retrieving categories' });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error retrieving category' });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category exists
    const category = await Category.getById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const products = await Product.getAll('', categoryId);
    
    res.json({
      category,
      products
    });
  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({ message: 'Server error retrieving category products' });
  }
};

// Create a new category (admin only)
exports.createCategory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    
    const category = new Category({
      name
    });
    
    const categoryId = await category.create();
    
    // Get the created category
    const createdCategory = await Category.getById(categoryId);
    
    res.status(201).json({
      message: 'Category created successfully',
      category: createdCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
};

// Update a category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    
    // Check if category exists
    const existingCategory = await Category.getById(req.params.id);
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = new Category({
      id: parseInt(req.params.id),
      name
    });
    
    const updated = await category.update();
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update category' });
    }
    
    // Get the updated category
    const updatedCategory = await Category.getById(req.params.id);
    
    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error updating category' });
  }
};

// Delete a category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category exists
    const existingCategory = await Category.getById(req.params.id);
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = new Category({
      id: parseInt(req.params.id)
    });
    
    const deleted = await category.delete();
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete category' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
};
