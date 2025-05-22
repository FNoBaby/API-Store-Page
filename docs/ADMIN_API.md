# Admin API Endpoints Documentation

This document provides a comprehensive reference of all administrative endpoints available in the e-commerce API, including the required parameters and expected responses. Use this as a guide for building your admin portal.

## Table of Contents

- [Authentication](#authentication)
- [Users Management](#users-management)
- [Products Management](#products-management)
- [Categories Management](#categories-management)
- [Orders Management](#orders-management)
- [Authentication & Authorization](#authentication--authorization)

## Authentication

### Admin Login

Same as regular login, but with admin credentials.

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "loginId": "admin@example.com",
  "password": "adminpassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin",
    "surname": "User",
    "email": "admin@example.com",
    "phone": "1234567890",
    "profileImage": "http://localhost:5000/uploads/profile_1.jpg",
    "role": "admin"
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
  "id": 1,
  "name": "Admin",
  "surname": "User",
  "email": "admin@example.com",
  "phone": "1234567890",
  "profileImage": "http://localhost:5000/uploads/profile_1.jpg",
  "role": "admin"
}
```

## Users Management

### Get All Users

```
GET /api/users
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Admin",
    "surname": "User",
    "email": "admin@example.com",
    "phone": "1234567890",
    "profileImage": "http://localhost:5000/uploads/profile_1.jpg",
    "role": "admin",
    "created_at": "2023-05-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "phone": "0987654321",
    "profileImage": "http://localhost:5000/uploads/profile_2.jpg",
    "role": "customer",
    "created_at": "2023-05-16T14:20:00Z"
  }
]
```

### Get User by ID

```
GET /api/users/:id
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
  "phone": "0987654321",
  "profileImage": "http://localhost:5000/uploads/profile_2.jpg",
  "role": "customer",
  "created_at": "2023-05-16T14:20:00Z"
}
```

## Products Management

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
    "featured": 1
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
    "featured": 0
  }
]
```

### Create New Product

```
POST /api/products
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
name: "Wireless Keyboard"
description: "Ergonomic wireless keyboard with long battery life"
price: 49.99
category_id: 1
image: (file) // Optional
active: true // Optional, defaults to true
featured: false // Optional, defaults to false
```

**Response:**
```json
{
  "message": "Product created successfully",
  "product": {
    "id": 3,
    "name": "Wireless Keyboard",
    "description": "Ergonomic wireless keyboard with long battery life",
    "price": 49.99,
    "category_id": 1,
    "category_name": "Electronics",
    "image": "http://localhost:5000/uploads/product_3.jpg",
    "active": 1,
    "featured": 0
  }
}
```

### Update Product

```
PUT /api/products/:id
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
name: "Wireless Keyboard Pro"
description: "Updated description for the wireless keyboard"
price: 59.99
category_id: 1
image: (file) // Optional
active: true // Optional
featured: true // Optional
```

**Response:**
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 3,
    "name": "Wireless Keyboard Pro",
    "description": "Updated description for the wireless keyboard",
    "price": 59.99,
    "category_id": 1,
    "category_name": "Electronics",
    "image": "http://localhost:5000/uploads/product_3.jpg",
    "active": 1,
    "featured": 1
  }
}
```

### Delete Product

```
DELETE /api/products/:id
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

## Categories Management

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
      "featured": 1
    },
    {
      "id": 3,
      "name": "Wireless Keyboard Pro",
      "description": "Updated description for the wireless keyboard",
      "price": 59.99,
      "category_id": 1,
      "image": "http://localhost:5000/uploads/product_3.jpg",
      "active": 1,
      "featured": 1
    }
  ]
}
```

### Create New Category

```
POST /api/categories
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Wearable Technology"
}
```

**Response:**
```json
{
  "message": "Category created successfully",
  "category": {
    "id": 4,
    "name": "Wearable Technology"
  }
}
```

### Update Category

```
PUT /api/categories/:id
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Wearables"
}
```

**Response:**
```json
{
  "message": "Category updated successfully",
  "category": {
    "id": 4,
    "name": "Wearables"
  }
}
```

### Delete Category

```
DELETE /api/categories/:id
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

## Orders Management

### Get All Orders

```
GET /api/orders/all
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "user_name": "John Doe",
    "total_amount": 124.98,
    "status": "pending",
    "created_at": "2023-05-20T15:30:00Z",
    "delivery_date": "2023-05-25",
    "item_count": 2
  },
  {
    "id": 2,
    "user_id": 3,
    "user_name": "Jane Smith",
    "total_amount": 99.99,
    "status": "processing",
    "created_at": "2023-05-21T10:15:00Z",
    "delivery_date": "2023-05-26",
    "item_count": 1
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
  "id": 1,
  "user_id": 2,
  "user_name": "John Doe",
  "total_amount": 124.98,
  "status": "pending",
  "created_at": "2023-05-20T15:30:00Z",
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
      "product_id": 2,
      "product_name": "Smartphone Stand",
      "product_image": "http://localhost:5000/uploads/product_2.jpg",
      "quantity": 1,
      "price": 24.99
    }
  ]
}
```

### Update Order Status

```
PUT /api/orders/:id/status
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "processing"
}
```

**Response:**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": 1,
    "user_id": 2,
    "user_name": "John Doe",
    "total_amount": 124.98,
    "status": "processing",
    "created_at": "2023-05-20T15:30:00Z",
    "delivery_date": "2023-05-25",
    "item_count": 2
  }
}
```

### Update Order Delivery Date

```
PUT /api/orders/:id/delivery-date
```

**Headers:**
```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "delivery_date": "2023-05-27"
}
```

**Response:**
```json
{
  "message": "Order delivery date updated successfully",
  "order": {
    "id": 1,
    "user_id": 2,
    "user_name": "John Doe",
    "total_amount": 124.98,
    "status": "processing",
    "created_at": "2023-05-20T15:30:00Z",
    "delivery_date": "2023-05-27",
    "item_count": 2
  }
}
```

## Authentication & Authorization

All admin endpoints require:

1. Authentication via the `x-auth-token` header
2. Admin authorization check - user's role must be "admin"

If either is missing, you will receive:

**401 Unauthorized:**
```json
{
  "message": "Token is not valid"
}
```

**403 Forbidden:**
```json
{
  "message": "Access denied. Admin privileges required."
}
```
