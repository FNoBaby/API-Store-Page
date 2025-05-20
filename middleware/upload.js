const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  DEFAULT_PROFILE_IMAGE, 
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_PROFILE_FILENAME,
  DEFAULT_PRODUCT_FILENAME
} = require('../utils/constants');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
  }
}

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

// Function to ensure default images exist
const ensureDefaultImages = () => {
  const defaultImages = {
    [DEFAULT_PROFILE_FILENAME]: DEFAULT_PROFILE_IMAGE,
    [DEFAULT_PRODUCT_FILENAME]: DEFAULT_PRODUCT_IMAGE
  };

  // Create defaults directory if it doesn't exist
  const defaultsDir = path.join(__dirname, '../uploads/defaults');
  if (!fs.existsSync(defaultsDir)) {
    fs.mkdirSync(defaultsDir, { recursive: true });
    console.log('Created uploads/defaults directory');
  }

  // The uploads directory itself
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }

  // Verify that default images are valid image files
  Object.keys(defaultImages).forEach(imageName => {
    const defaultPath = path.join(defaultsDir, imageName);
    const mainPath = path.join(uploadsDir, imageName);
    
    try {
      // If path exists but is not a valid image file (might be our placeholder text file)
      if (fs.existsSync(defaultPath)) {
        const stats = fs.statSync(defaultPath);
        // If file is suspiciously small (likely the placeholder text)
        if (stats.size < 1000) {
          console.log(`Warning: Default image ${imageName} may not be a valid image file. Consider downloading the actual image.`);
        }
      }
      
      // Copy from defaults to uploads directory if it doesn't exist
      if (!fs.existsSync(mainPath) && fs.existsSync(defaultPath)) {
        fs.copyFileSync(defaultPath, mainPath);
        console.log(`Copied default image from defaults: ${imageName}`);
      }
    } catch (err) {
      console.error(`Error handling default image ${imageName}:`, err);
    }
  });
};

// Create copies from defaults to uploads directory
const linkDefaultImages = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const defaultsDir = path.join(__dirname, '../uploads/defaults');

  // Create copies for each default image
  fs.readdirSync(defaultsDir).forEach(file => {
    const sourcePath = path.join(defaultsDir, file);
    const targetPath = path.join(uploadsDir, file);

    if (!fs.existsSync(targetPath) && file !== '.gitkeep') {
      try {
        // Copy file instead of symlink for better compatibility
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied default image: ${file}`);
      } catch (err) {
        console.error(`Error copying default image ${file}:`, err);
      }
    }
  });
};

// Ensure default images exist on module initialization
ensureDefaultImages();
linkDefaultImages();

module.exports = upload;
