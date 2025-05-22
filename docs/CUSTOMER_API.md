# Customer API Endpoints Documentation

This document provides a comprehensive reference of all customer-facing endpoints available in the e-commerce API, including the required parameters and expected responses.

## Table of Contents

- [Authentication](#authentication)
- [User Profile](#user-profile)
- [Products](#products)
- [Categories](#categories)
- [Cart](#cart)
- [Orders](#orders)

## Authentication

### Register a New User

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "profileImage": "http://localhost:5000/uploads/default-profile.png",
    "role": "customer"
  }
}
```

### Login User

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "loginId": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "profileImage": "http://localhost:5000/uploads/profile_2.jpg",
    "role": "customer"
  }
}
```

### Get Current User Profile

```
GET /api/auth/me
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": 2,
  "name": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "profileImage": "http://localhost:5000/uploads/profile_2.jpg",
  "role": "customer"
}
```

## User Profile

### Update User Profile

```
PUT /api/users/profile
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
name: "John"
surname: "Doe"
email: "john@example.com"
phone: "1234567890"
profileImage: (file) // Optional
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 2,
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "profileImage": "http://localhost:5000/uploads/profile_2.jpg",
    "role": "customer"
  }
}
```

### Update Password

```
PUT /api/users/password
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### Delete Account

```
DELETE /api/users
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

## Products

### Get All Products

```
GET /api/products
```

**Query Parameters:**
- `search` (optional): Search term for product name/description
- `category` (optional): Filter by category ID

**Response:**
```json
[
  {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 99.99,
    "category_id": 1,
    "category_name": "Electronics",
    "image": "http://localhost:5000/uploads/product_1.jpg",
    "active": 1,
    "stock": 25
  },
  {
    "id": 2,
    "name": "Smartphone Stand",
    "description": "Adjustable smartphone stand for desk use",
    "price": 24.99,
    "category_id": 2,
    "category_name": "Accessories",
    "image": "http://localhost:5000/uploads/product_2.jpg",
    "active": 1,
    "stock": 50
  }
]
```

### Get Random Products

```
GET /api/products/random
```

**Query Parameters:**
- `limit` (optional): Number of random products to return (default: 4)

**Response:**
```json
[
  {
    "id": 3,
    "name": "Wireless Keyboard Pro",
    "description": "Ergonomic wireless keyboard with long battery life",
    "price": 59.99,
    "category_id": 1,
    "category_name": "Electronics",
    "image": "http://localhost:5000/uploads/product_3.jpg",
    "active": 1,
    "stock": 12
  },
  {
    "id": 5,
    "name": "Bluetooth Speaker",
    "description": "Portable Bluetooth speaker with 20-hour battery life",
    "price": 79.99,
    "category_id": 1,
    "category_name": "Electronics",
    "image": "http://localhost:5000/uploads/product_5.jpg",
    "active": 1,
    "stock": 25
  }
]
```

### Get Product by ID

```
GET /api/products/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 99.99,
  "category_id": 1,
  "category_name": "Electronics",
  "image": "http://localhost:5000/uploads/product_1.jpg",
  "active": 1,
  "stock": 25
}
```

### Get Product Image

```
GET /api/products/:id/image
```

**Response:** 
The actual image file (JPG/PNG) rather than JSON data.

## Categories

### Get All Categories

```
GET /api/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Electronics"
  },
  {
    "id": 2,
    "name": "Accessories"
  },
  {
    "id": 3,
    "name": "Home & Kitchen"
  }
]
```

### Get Category by ID

```
GET /api/categories/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Electronics"
}
```

### Get Products by Category

```
GET /api/categories/:id/products
```

**Response:**
```json
{
  "category": {
    "id": 1,
    "name": "Electronics"
  },
  "products": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 99.99,
      "category_id": 1,
      "image": "http://localhost:5000/uploads/product_1.jpg",
      "active": 1,
      "stock": 25
    },
    {
      "id": 3,
      "name": "Wireless Keyboard Pro",
      "description": "Updated description for the wireless keyboard",
      "price": 59.99,
      "category_id": 1,
      "image": "http://localhost:5000/uploads/product_3.jpg",
      "active": 1,
      "stock": 12
    }
  ]
}
```

## Cart

### Get User's Cart

```
GET /api/cart
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": 1,
  "user_id": 2,
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Wireless Headphones",
      "product_image": "http://localhost:5000/uploads/product_1.jpg",
      "product_price": 99.99,
      "quantity": 1,
      "item_total": 99.99
    },
    {
      "id": 2,
      "product_id": 2,
      "product_name": "Smartphone Stand",
      "product_image": "http://localhost:5000/uploads/product_2.jpg",
      "product_price": 24.99,
      "quantity": 1,      "item_total": 24.99,
      "stock": 50
    }
  ],
  "total_amount": 124.98
}
```

### Add Item to Cart

```
POST /api/cart
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": 3,
  "quantity": 1
}
```

**Response:**
```json
{
  "message": "Item added to cart",
  "cart": {
    "id": 1,
    "user_id": 2,
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Wireless Headphones",
        "product_image": "http://localhost:5000/uploads/product_1.jpg",
        "product_price": 99.99,
        "quantity": 1,
        "item_total": 99.99
      },
      {
        "id": 2,
        "product_id": 2,
        "product_name": "Smartphone Stand",
        "product_image": "http://localhost:5000/uploads/product_2.jpg",
        "product_price": 24.99,
        "quantity": 1,
        "item_total": 24.99
      },
      {
        "id": 3,
        "product_id": 3,
        "product_name": "Wireless Keyboard Pro",
        "product_image": "http://localhost:5000/uploads/product_3.jpg",
        "product_price": 59.99,
        "quantity": 1,      "item_total": 59.99,
      "stock": 12
      }
    ],
    "total_amount": 184.97
  }
}
```

### Update Cart Item Quantity

```
PUT /api/cart/:productId
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Cart updated",
  "cart": {
    "id": 1,
    "user_id": 2,
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Wireless Headphones",
        "product_image": "http://localhost:5000/uploads/product_1.jpg",
        "product_price": 99.99,
        "quantity": 1,
        "item_total": 99.99
      },
      {
        "id": 2,
        "product_id": 2,
        "product_name": "Smartphone Stand",
        "product_image": "http://localhost:5000/uploads/product_2.jpg",
        "product_price": 24.99,
        "quantity": 2,
        "item_total": 49.98
      },
      {
        "id": 3,
        "product_id": 3,
        "product_name": "Wireless Keyboard Pro",
        "product_image": "http://localhost:5000/uploads/product_3.jpg",
        "product_price": 59.99,
        "quantity": 1,
        "item_total": 59.99
      }
    ],
    "total_amount": 209.96
  }
}
```

### Remove Item from Cart

```
DELETE /api/cart/:productId
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Item removed from cart",
  "cart": {
    "id": 1,
    "user_id": 2,
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Wireless Headphones",
        "product_image": "http://localhost:5000/uploads/product_1.jpg",
        "product_price": 99.99,
        "quantity": 1,
        "item_total": 99.99
      },
      {
        "id": 3,
        "product_id": 3,
        "product_name": "Wireless Keyboard Pro",
        "product_image": "http://localhost:5000/uploads/product_3.jpg",
        "product_price": 59.99,
        "quantity": 1,
        "item_total": 59.99
      }
    ],
    "total_amount": 159.98
  }
}
```

### Clear Cart

```
DELETE /api/cart
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Cart cleared",
  "cart": {
    "id": 1,
    "user_id": 2,
    "items": [],
    "total_amount": 0
  }
}
```

## Orders

### Create Order from Cart

```
POST /api/orders
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "delivery_date": "2023-05-25"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 3,
    "user_id": 2,
    "user_name": "John Doe",
    "total_amount": 159.98,
    "status": "pending",
    "created_at": "2023-05-22T14:30:00Z",
    "delivery_date": "2023-05-25",
    "item_count": 2,
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Wireless Headphones",
        "product_image": "http://localhost:5000/uploads/product_1.jpg",
        "quantity": 1,
        "price": 99.99
      },
      {
        "id": 2,
        "product_id": 3,
        "product_name": "Wireless Keyboard Pro",
        "product_image": "http://localhost:5000/uploads/product_3.jpg",
        "quantity": 1,
        "price": 59.99
      }
    ]
  }
}
```

### Get User's Orders

```
GET /api/orders
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": 3,
    "user_id": 2,
    "total_amount": 159.98,
    "status": "pending",
    "created_at": "2023-05-22T14:30:00Z",
    "delivery_date": "2023-05-25",
    "item_count": 2
  },
  {
    "id": 1,
    "user_id": 2,
    "total_amount": 124.98,
    "status": "completed",
    "created_at": "2023-05-20T15:30:00Z",
    "delivery_date": "2023-05-21",
    "item_count": 2
  }
]
```

### Get Order Details

```
GET /api/orders/:id
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": 3,
  "user_id": 2,
  "user_name": "John Doe",
  "total_amount": 159.98,
  "status": "pending",
  "created_at": "2023-05-22T14:30:00Z",
  "delivery_date": "2023-05-25",
  "item_count": 2,
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Wireless Headphones",
      "product_image": "http://localhost:5000/uploads/product_1.jpg",
      "quantity": 1,
      "price": 99.99
    },
    {
      "id": 2,
      "product_id": 3,
      "product_name": "Wireless Keyboard Pro",
      "product_image": "http://localhost:5000/uploads/product_3.jpg",
      "quantity": 1,
      "price": 59.99
    }
  ]
}
```

## Authentication & Authorization

All authenticated endpoints require:

1. Authentication via the `x-auth-token` header

If authentication is missing or invalid, you will receive:

**401 Unauthorized:**
```json
{
  "message": "No token, authorization denied"
}
```

or

```json
{
  "message": "Token is not valid"
}
```

For endpoints that require specific permissions (like accessing another user's data), you may receive:

**403 Forbidden:**
```json
{
  "message": "Unauthorized access to this order"
}
```
