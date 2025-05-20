const { pool } = require('../config/db');

class Order {
  constructor(orderData) {
    this.id = orderData.id;
    this.user_id = orderData.user_id;
    this.total_amount = orderData.total_amount;
    this.status = orderData.status || 'pending';
    this.created_at = orderData.created_at;
    this.items = orderData.items || [];
  }

  // Create a new order
  async create() {
    const connection = await pool.getConnection();
    
    try {
      // Begin transaction
      await connection.beginTransaction();
      
      // Insert order
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (userID, totalAmount, orderStatus, orderDate) VALUES (?, ?, ?, NOW())',
        [this.user_id, this.total_amount, this.status]
      );
      
      this.id = orderResult.insertId;
      
      // Insert order items
      for (const item of this.items) {
        await connection.execute(
          'INSERT INTO order_items (orderID, productID, quantity, price) VALUES (?, ?, ?, ?)',
          [this.id, item.product_id, item.quantity, item.price]
        );
      }
      
      // Commit transaction
      await connection.commit();
      return this.id;
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      console.error('Error creating order:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all orders with optional user filter
  static async getAll(userId = null) {
    try {
      let query = `
        SELECT o.orderID as id, o.userID as user_id, 
        CONCAT(u.name, ' ', u.surname) as user_name,
        o.totalAmount as total_amount, o.orderStatus as status, 
        o.orderDate as created_at
        FROM orders o
        LEFT JOIN users u ON o.userID = u.userID
      `;
      
      const params = [];
      
      if (userId) {
        query += ' WHERE o.userID = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY o.orderDate DESC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  // Get order by ID with order items
  static async getById(id) {
    try {
      // Get order
      const [orderRows] = await pool.execute(
        `SELECT o.orderID as id, o.userID as user_id, 
        CONCAT(u.name, ' ', u.surname) as user_name,
        o.totalAmount as total_amount, o.orderStatus as status, 
        o.orderDate as created_at
        FROM orders o
        LEFT JOIN users u ON o.userID = u.userID
        WHERE o.orderID = ?`,
        [id]
      );
      
      if (orderRows.length === 0) {
        return null;
      }
      
      const order = orderRows[0];
      
      // Get order items
      const [itemsRows] = await pool.execute(
        `SELECT oi.orderItemID as id, oi.productID as product_id, 
        p.name as product_name, p.image as product_image,
        oi.quantity, oi.price
        FROM order_items oi
        LEFT JOIN products p ON oi.productID = p.productID
        WHERE oi.orderID = ?`,
        [id]
      );
      
      order.items = itemsRows;
      
      return order;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  // Update order status
  async updateStatus() {
    try {
      // Validate status value to match database enum values
      const allowed_statuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!allowed_statuses.includes(this.status)) {
        throw new Error('Invalid order status');
      }
      
      const [result] = await pool.execute(
        'UPDATE orders SET orderStatus = ? WHERE orderID = ?',
        [this.status, this.id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}

module.exports = Order;
