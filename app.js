const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const errorHandler = require('./middleware/errorHandler');
const { DEFAULT_PROFILE_IMAGE, DEFAULT_PRODUCT_IMAGE, 
        DEFAULT_PROFILE_FILENAME, DEFAULT_PRODUCT_FILENAME } = require('./utils/constants');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Image Handling System
 * 
 * The following special routes implement a multi-level fallback system for default images:
 * 1. First checks if the image exists in the main uploads directory
 * 2. If not, falls back to the defaults directory
 * 3. As a last resort, redirects to an external URL
 * 
 * This ensures that default images are always available, even if the local files
 * are missing or corrupted.
 */

// Special route to handle default profile image
app.get(`/uploads/${DEFAULT_PROFILE_FILENAME}`, (req, res) => {
  // Check if the file exists in the uploads folder
  const localPath = path.join(__dirname, 'uploads', DEFAULT_PROFILE_FILENAME);
  const defaultsPath = path.join(__dirname, 'uploads', 'defaults', DEFAULT_PROFILE_FILENAME);
  
  if (fs.existsSync(localPath)) {
    // If it exists locally, serve the file
    res.sendFile(localPath);
  } else if (fs.existsSync(defaultsPath)) {
    // If it exists in defaults directory, serve that
    res.sendFile(defaultsPath);
  } else {
    // If neither exists, redirect to the external URL
    console.log('Profile image not found locally, redirecting to external URL');
    res.redirect(DEFAULT_PROFILE_IMAGE);
  }
});

// Special route to handle default product image
app.get(`/uploads/${DEFAULT_PRODUCT_FILENAME}`, (req, res) => {
  // Check if the file exists in the uploads folder
  const localPath = path.join(__dirname, 'uploads', DEFAULT_PRODUCT_FILENAME);
  const defaultsPath = path.join(__dirname, 'uploads', 'defaults', DEFAULT_PRODUCT_FILENAME);
  
  if (fs.existsSync(localPath)) {
    // If it exists locally, serve the file
    res.sendFile(localPath);
  } else if (fs.existsSync(defaultsPath)) {
    // If it exists in defaults directory, serve that
    res.sendFile(defaultsPath);
  } else {
    // If neither exists, redirect to the external URL
    console.log('Product image not found locally, redirecting to external URL');
    res.redirect(DEFAULT_PRODUCT_IMAGE);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

module.exports = app;
