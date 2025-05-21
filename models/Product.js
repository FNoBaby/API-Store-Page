const { pool } = require('../config/db');
const { DEFAULT_PRODUCT_FILENAME } = require('../utils/constants');

class Product {
  constructor(productData) {
    this.id = productData.id;
    this.name = productData.name;
    this.description = productData.description;
    this.price = productData.price;
    this.category_id = productData.category_id;
    this.image = productData.image || DEFAULT_PRODUCT_FILENAME;
    this.active = productData.active !== undefined ? productData.active : 1;
    this.featured = productData.featured !== undefined ? productData.featured : 0;
  }

  // Get all products with optional search and category filter
  static async getAll(search = '', categoryId = null) {
    try {
      let query = `
        SELECT p.productID as id, p.name, p.description, p.price, 
        p.category as category_id, c.name as category_name,
        p.imagePath as image, p.active
        FROM products p
        LEFT JOIN categories c ON p.category = c.categoryID
      `;
      
      let whereClause = '';
      const params = [];
      
      if (search) {
        whereClause = 'WHERE (p.name LIKE ? OR p.description LIKE ?) AND p.active = 1';
        params.push(`%${search}%`, `%${search}%`);
      } else {
        whereClause = 'WHERE p.active = 1';
      }
      
      if (categoryId) {
        if (whereClause === '') {
          whereClause = 'WHERE p.category = ? AND p.active = 1';
        } else {
          whereClause += ' AND p.category = ?';
        }
        params.push(categoryId);
      }
      
      query = query + whereClause + ' ORDER BY p.productID DESC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getById(id) {
    try {
      const query = `
        SELECT p.productID as id, p.name, p.description, p.price, 
        p.category as category_id, c.name as category_name,
        p.imagePath as image, p.active
        FROM products p
        LEFT JOIN categories c ON p.category = c.categoryID
        WHERE p.productID = ?
        LIMIT 1
      `;
      
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  // Create a new product
  async create() {
    try {
      const query = `
        INSERT INTO products (name, description, price, category, active, featured) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        this.name,
        this.description,
        this.price,
        this.category_id,
        this.active,
        this.featured
      ]);
      
      this.id = result.insertId;
      return this.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update a product
  async update() {
    try {
      const query = `
        UPDATE products
        SET name = ?, description = ?, price = ?, category = ?, active = ?, featured = ?
        WHERE productID = ?
      `;
      
      const params = [
        this.name,
        this.description,
        this.price,
        this.category_id,
        this.active,
        this.featured,
        this.id
      ];
      
      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete a product (soft or hard delete)
  async delete() {
    try {
      // Check if product has any order references
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM order_items WHERE productID = ?',
        [this.id]
      );
      
      if (rows[0].count > 0) {
        // Soft delete by setting active = 0
        const [result] = await pool.execute(
          'UPDATE products SET active = 0 WHERE productID = ?',
          [this.id]
        );
        return result.affectedRows > 0;
      } else {
        // Hard delete if no orders reference this product
        const [result] = await pool.execute(
          'DELETE FROM products WHERE productID = ?',
          [this.id]
        );
        return result.affectedRows > 0;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Get random products
  static async getRandomProducts(limit = 4) {
    try {
      // Check if image column exists
      let hasImageColumn = false;
      try {
        const [columns] = await pool.execute("SHOW COLUMNS FROM products LIKE 'image'");
        hasImageColumn = columns.length > 0;
      } catch (error) {
        console.warn("Couldn't check for image column:", error.message);
      }
        const query = `
        SELECT p.productID as id, p.name, p.description, p.price, 
        p.category as category_id, c.name as category_name,
        ${hasImageColumn ? 'p.image,' : ''} p.active
        FROM products p
        LEFT JOIN categories c ON p.category = c.categoryID
        WHERE p.active = 1
        ORDER BY RAND()
        LIMIT ?
      `;
      
      const [rows] = await pool.execute(query, [limit]);
      return rows;
    } catch (error) {
      console.error('Error getting random products:', error);
      throw error;
    }
  }

  // Get product image URL
  static getProductImageUrl(req, image) {
    const baseUrl = `${req.protocol}://${req.get('host')}/images/products/`;
    return `${baseUrl}${image || DEFAULT_PRODUCT_FILENAME}`;
  }

  // Get product image filename
  static getProductImageFilename(productId) {
    return `product_${productId}.jpg`;
  }

  // Get product image path
  static getProductImagePath(productId) {
    return `images/products/product_${productId}.jpg`;
  }

  // Get product image path for admin
  static getProductImagePathAdmin(productId) {
    return `images/products/product_${productId}.jpg`;
  }
}

module.exports = Product;
