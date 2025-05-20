const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getRandomProducts 
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');
const { body } = require('express-validator');

// Get all products with optional filtering
router.get('/', getAllProducts);

// Get random products
router.get('/random', getRandomProducts);

// Get product by ID
router.get('/:id', getProductById);

// Create a new product (admin only)
router.post('/', [
  auth, 
  admin,
  upload.single('image'),
  // Validation rules
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category_id').isNumeric().withMessage('Category ID must be a number')
], createProduct);

// Update a product (admin only)
router.put('/:id', [
  auth, 
  admin,
  upload.single('image'),
  // Validation rules
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category_id').isNumeric().withMessage('Category ID must be a number')
], updateProduct);

// Delete a product (admin only)
router.delete('/:id', [auth, admin], deleteProduct);

module.exports = router;
