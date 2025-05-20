// Download default images from URLs
const fs = require('fs');
const path = require('path');
const https = require('https');
const { 
  DEFAULT_PROFILE_IMAGE, 
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_PROFILE_FILENAME,
  DEFAULT_PRODUCT_FILENAME
} = require('./utils/constants');

console.log('Starting to download default images...');

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });
      
      file.on('error', err => {
        fs.unlink(filepath, () => {}); // Delete the file if there was an error
        reject(err);
      });
    }).on('error', err => {
      fs.unlink(filepath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
};

const main = async () => {
  try {
    // Create directories if they don't exist
    const defaultsDir = path.join(__dirname, 'uploads/defaults');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    if (!fs.existsSync(defaultsDir)) {
      fs.mkdirSync(defaultsDir, { recursive: true });
    }
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Download profile image
    const profileDefaultPath = path.join(defaultsDir, DEFAULT_PROFILE_FILENAME);
    const profileMainPath = path.join(uploadsDir, DEFAULT_PROFILE_FILENAME);
    
    await downloadImage(DEFAULT_PROFILE_IMAGE, profileDefaultPath);
    fs.copyFileSync(profileDefaultPath, profileMainPath);
    console.log(`Copied to: ${profileMainPath}`);
    
    // Download product image
    const productDefaultPath = path.join(defaultsDir, DEFAULT_PRODUCT_FILENAME);
    const productMainPath = path.join(uploadsDir, DEFAULT_PRODUCT_FILENAME);
    
    await downloadImage(DEFAULT_PRODUCT_IMAGE, productDefaultPath);
    fs.copyFileSync(productDefaultPath, productMainPath);
    console.log(`Copied to: ${productMainPath}`);
    
    console.log('All default images downloaded and copied successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
};

main();
