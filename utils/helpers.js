/**
 * Helper utility functions for the API
 */
const { DEFAULT_PROFILE_FILENAME, DEFAULT_PRODUCT_FILENAME } = require('./constants');

// Format price to 2 decimal places
exports.formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

// Generate a random string
exports.generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Format date to a readable format
exports.formatDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Truncate text with ellipsis
exports.truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Calculate pagination info
exports.getPaginationInfo = (total, page, limit) => {
  const currentPage = parseInt(page) || 1;
  const perPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(total / perPage);
  
  return {
    currentPage,
    perPage,
    totalItems: total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

// Get the full URL for a profile image
exports.getImageUrl = (req, imageName) => {
  if (!imageName || imageName === 'null' || imageName === 'undefined') {
    // Return default image if no image name provided
    return `${req.protocol}://${req.get('host')}/uploads/${DEFAULT_PROFILE_FILENAME}`;
  }
  
  // Check if it's already a full URL
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }
  
  // Return constructed URL to the image
  return `${req.protocol}://${req.get('host')}/uploads/${imageName}`;
};

// Get product image URL
exports.getProductImageUrl = (req, imageName) => {
  if (!imageName || imageName === 'null' || imageName === 'undefined') {
    // Return default product image if no image name provided
    return `${req.protocol}://${req.get('host')}/uploads/${DEFAULT_PRODUCT_FILENAME}`;
  }
  
  // Check if it's already a full URL
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
    return imageName;
  }
  
  // Return constructed URL to the image
  return `${req.protocol}://${req.get('host')}/uploads/${imageName}`;
};
