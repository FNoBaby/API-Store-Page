const { pool } = require('../config/db');

class Category {
  constructor(categoryData) {
    this.id = categoryData.id;
    this.name = categoryData.name;
  }

  // Get all categories
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT categoryID as id, name FROM categories ORDER BY name'
      );
      return rows;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Get category by ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT categoryID as id, name FROM categories WHERE categoryID = ? LIMIT 1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  }

  // Create a new category
  async create() {
    try {
      const [result] = await pool.execute(
        'INSERT INTO categories (name) VALUES (?)',
        [this.name]
      );
      
      this.id = result.insertId;
      return this.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Update a category
  async update() {
    try {
      const [result] = await pool.execute(
        'UPDATE categories SET name = ? WHERE categoryID = ?',
        [this.name, this.id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete a category
  async delete() {
    try {
      const [result] = await pool.execute(
        'DELETE FROM categories WHERE categoryID = ?',
        [this.id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

module.exports = Category;
