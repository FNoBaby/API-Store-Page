# E-Commerce API with Node.js and MySQL

A RESTful API built with Node.js, Express, and MySQL that powers an e-commerce application. This API provides endpoints for user authentication, product management, shopping cart functionality, order processing, and more.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Products](#products)
  - [Categories](#categories)
  - [Cart](#cart)
  - [Orders](#orders)
- [Database Schema](#database-schema)
- [File Structure](#file-structure)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Management**: Registration, authentication, profile management
- **Product Management**: CRUD operations for products with search and filtering
- **Category Management**: Organize products by categories
- **Shopping Cart**: Persistent cart functionality
- **Order Processing**: Create and manage orders
- **Payment Integration**: Ready for payment gateway integration
- **Image Upload**: Product and user profile image uploads with fallback to default images
- **Authentication & Authorization**: JWT-based authentication and role-based access control
- **API Security**: Implemented with best practices for API security
- **Input Validation**: Comprehensive input validation
- **Error Handling**: Structured error responses

## Requirements

- Node.js (v14+)
- MySQL (v5.7+)
- NPM or Yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/FNoBaby/API-Store-Page--Node.js-.git
   cd API-Store-Page--Node.js
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up default images:
   ```bash
   npm run setup:images
   ```

4. Create a `.env` file in the root directory (see [Configuration](#configuration))

5. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=your_db_host
DB_USERNAME=your_db_username
DB_PASSWORD=your_password
DB_NAME=your_db_name

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Server Configuration
PORT=5000
NODE_ENV=development
```

Make sure to replace the placeholder values with your actual configuration.

## Default Images

The API uses default images for products and user profiles when no image is provided:

1. **Default User Profile Image**: `uploads/default-profile.png`
2. **Default Product Image**: `uploads/default-product.png`

These default images are automatically set up when the application starts. In development, placeholder files are created. For production:

1. Replace these placeholders with actual images
2. The recommended default profile image is a generic avatar
3. The recommended default product image is a "no image available" placeholder

To customize the default images:

1. Replace the files in the `uploads/defaults` directory
2. The system will automatically copy them to the `uploads` directory if they don't exist

## API Documentation

### Authentication

#### Register a new user
```
POST /api/auth/register
```
Request body:
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "customer" // Optional, defaults to "customer"
}
```

#### Login
```
POST /api/auth/login
```
Request body:
```json
{
  "loginId": "john@example.com", // Email or phone
  "password": "password123"
}
```

#### Get current user
```
GET /api/auth/me
```
Headers:
```
x-auth-token: <your_jwt_token>
```

### Users

#### Get all users (Admin only)
```
GET /api/users
```

#### Get user by ID (Admin only)
```
GET /api/users/:id
```

#### Update user profile
```
PUT /api/users/profile
```
Request body (multipart/form-data):
```
name: "John"
surname: "Doe"
email: "john@example.com"
phone: "1234567890"
profileImage: (file) // Optional
```

#### Update password
```
PUT /api/users/password
```
Request body:
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### Delete account
```
DELETE /api/users
```

### Products

#### Get all products
```
GET /api/products
```
Query parameters:
- search: Search term for product name/description
- category: Filter by category ID

#### Get random products
```
GET /api/products/random
```
Query parameters:
- limit: Number of random products (default: 4)

#### Get product by ID
```
GET /api/products/:id
```

#### Get product image
```
GET /api/products/:id/image
```
Direct access to product images. Returns the actual image file (JPG/PNG) rather than JSON data.

#### Create product (Admin only)
```
POST /api/products
```
Request body (multipart/form-data):
```
name: "Product Name"
description: "Product Description"
price: 29.99
category_id: 1
image: (file) // Optional
active: true // Optional
featured: false // Optional
```

#### Update product (Admin only)
```
PUT /api/products/:id
```
Request body (multipart/form-data):
```
name: "Updated Product Name"
description: "Updated Product Description"
price: 39.99
category_id: 2
image: (file) // Optional
active: true // Optional
featured: true // Optional
```

#### Delete product (Admin only)
```
DELETE /api/products/:id
```

### Categories

#### Get all categories
```
GET /api/categories
```

#### Get category by ID
```
GET /api/categories/:id
```

#### Get products by category
```
GET /api/categories/:id/products
```

#### Create category (Admin only)
```
POST /api/categories
```
Request body:
```json
{
  "name": "Category Name"
}
```

#### Update category (Admin only)
```
PUT /api/categories/:id
```
Request body:
```json
{
  "name": "Updated Category Name"
}
```

#### Delete category (Admin only)
```
DELETE /api/categories/:id
```

### Cart

#### Get user's cart
```
GET /api/cart
```

#### Add item to cart
```
POST /api/cart
```
Request body:
```json
{
  "productId": 1,
  "quantity": 2 // Optional, defaults to 1
}
```

#### Update cart item quantity
```
PUT /api/cart/:productId
```
Request body:
```json
{
  "quantity": 3
}
```

#### Remove item from cart
```
DELETE /api/cart/:productId
```

#### Clear cart
```
DELETE /api/cart
```

### Orders

#### Create order from cart
```
POST /api/orders
```
Request body:
```json
{
  "delivery_date": "2023-12-31" // Optional, expected date of delivery in ISO 8601 format (YYYY-MM-DD)
}
```

#### Get user's orders
```
GET /api/orders
```

#### Get order details
```
GET /api/orders/:id
```

#### Get all orders (Admin only)
```
GET /api/orders/all
```

#### Update order status (Admin only)
```
PUT /api/orders/:id/status
```
Request body:
```json
{
  "status": "processing" // Options: pending, processing, completed, cancelled
}
```

#### Update order delivery date (Admin only)
```
PUT /api/orders/:id/delivery-date
```
Request body:
```json
{
  "delivery_date": "2023-12-31" // Expected date of delivery in ISO 8601 format (YYYY-MM-DD)
}
```

## Database Schema

The API works with the following database schema:

### Users
- **userID**: int (Primary Key, Auto Increment)
- **name**: varchar(50)
- **surname**: varchar(50)
- **email**: varchar(100) (Unique)
- **phone**: varchar(20) (Unique)
- **passwordHash**: varchar(255)
- **profileImage**: varchar(255)
- **role**: enum('customer', 'admin')
- **registrationDate**: datetime

### Categories
- **categoryID**: int (Primary Key, Auto Increment)
- **name**: varchar(100)

### Products
- **productID**: int (Primary Key, Auto Increment)
- **name**: varchar(255)
- **description**: text
- **price**: decimal(10,2)
- **category**: int (Foreign Key to categories.categoryID)
- **image**: varchar(255)
- **active**: tinyint(1)
- **featured**: tinyint(1)

### Orders
- **orderID**: int (Primary Key, Auto Increment)
- **userID**: int (Foreign Key to users.userID)
- **totalAmount**: decimal(10,2)
- **orderStatus**: enum('pending', 'processing', 'completed', 'cancelled')
- **orderDate**: datetime
- **delivery_date**: date (nullable, date when order should be delivered)

### Order Items
- **orderItemID**: int (Primary Key, Auto Increment)
- **orderID**: int (Foreign Key to orders.orderID)
- **productID**: int (Foreign Key to products.productID)
- **quantity**: int
- **price**: decimal(10,2)

### Carts (New for Node.js API)
- **id**: int (Primary Key, Auto Increment)
- **user_id**: int (Foreign Key to users.userID)
- **created_at**: timestamp

### Cart Items (New for Node.js API)
- **id**: int (Primary Key, Auto Increment)
- **cart_id**: int (Foreign Key to carts.id)
- **product_id**: int (Foreign Key to products.productID)
- **quantity**: int
- **created_at**: timestamp

## File Structure

```
/e-commerce-api
  /config
    - db.js            # Database connection
  /controllers
    - authController.js     # User authentication
    - userController.js     # User operations
    - productController.js  # Product operations
    - categoryController.js # Category operations
    - cartController.js     # Cart operations
    - orderController.js    # Order processing
  /middleware
    - auth.js          # Authentication middleware
    - admin.js         # Admin authorization middleware
    - upload.js        # File upload middleware
    - validate.js      # Input validation middleware
    - errorHandler.js  # Error handling middleware
  /models
    - User.js          # User model
    - Product.js       # Product model
    - Category.js      # Category model
    - Order.js         # Order model
    - Cart.js          # Cart model  /routes
    - auth.js          # Authentication routes
    - users.js         # User routes
    - products.js      # Product routes
    - categories.js    # Category routes
    - cart.js          # Cart routes
    - orders.js        # Order routes
  /uploads             # Uploaded files directory
    /defaults          # Default images directory
      - default-profile.png # Default user profile image
      - default-product.png # Default product image
  /utils
    - constants.js     # Application constants including default image paths
    - helpers.js       # Helper functions including image URL construction
    - helpers.js       # Helper functions
  - .env               # Environment variables
  - .gitignore         # Git ignore file
  - app.js             # Express app setup
  - server.js          # Entry point
  - README.md          # Project documentation
```

## Security

This API implements several security best practices:

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Secure password storage with bcrypt
- **Input Validation**: All user inputs are validated
- **CORS Protection**: Configurable CORS settings
- **Helmet**: HTTP security headers
- **Role-based Access Control**: Admin and customer role separation
- **Error Handling**: Secure error responses (no stack traces in production)

## Image Handling System

The API provides a robust image handling system for both product and user profile images:

### Default Images

- Default images are provided as fallbacks when no user-uploaded images are available
- The system uses a multi-level fallback approach:
  1. First, it checks for the user-uploaded image
  2. If not found, it falls back to a default image in the uploads directory
  3. If that's not available, it falls back to a default image in the defaults directory
  4. If all local options fail, it redirects to an external URL

### Setup Default Images

For proper operation, default images need to be downloaded. Run:

```bash
npm run setup:images
```

This script will:
1. Download default images from the URLs defined in `constants.js`
2. Save them in both the `uploads/defaults` directory and the `uploads` directory
3. Ensure the fallback system works properly

You can also customize the default images by:
1. Replacing the image files in the `uploads/defaults` directory
2. Running the application, which will automatically copy them to the uploads directory

### Image URLs

- All image URLs are properly formatted in API responses
- The system handles both absolute URLs and relative paths
- Images are served from the `/uploads` endpoint

### Configuration

Default image paths and URLs are configured in `utils/constants.js` and can be customized as needed.

## Testing

Run automated tests with:

```bash
npm test
```

## Deployment

### Preparing for Production

1. Set the `NODE_ENV` to `production` in your `.env` file:
   ```
   NODE_ENV=production
   ```

2. Use a process manager like PM2:
   ```bash
   npm install pm2 -g
   pm2 start server.js --name "e-commerce-api"
   ```

3. Set up a reverse proxy with Nginx or Apache

### Database for Production

1. Use a managed database service or dedicated database server
2. Implement database backups
3. Configure connection pooling appropriately

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
