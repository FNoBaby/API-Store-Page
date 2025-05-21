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
        'INSERT INTO orders (userID, totalPrice, status, orderDate) VALUES (?, ?, ?, NOW())',
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
        o.totalPrice as total_amount, o.status as status, 
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
        const [orderRows] = await pool.execute(query, params);
      
      // If there are no orders, return empty array
      if (orderRows.length === 0) {
        return [];
      }
      
      // For each order, get the total item count accounting for quantities
      for (const order of orderRows) {
        const [countRows] = await pool.execute(
          'SELECT SUM(quantity) as item_count FROM order_items WHERE orderID = ?',
          [order.id]
        );
        order.item_count = countRows[0].item_count || 0; // Use 0 if result is NULL
      }
      
      return orderRows;
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
        o.totalPrice as total_amount, o.status as status, 
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
        p.name as product_name, p.imagePath as product_image,
        oi.quantity, p.price as price
        FROM order_items oi
        LEFT JOIN products p ON oi.productID = p.productID
        WHERE oi.orderID = ?`,
        [id]
      );
        order.items = itemsRows;
      
      // Calculate total item count based on quantities
      let totalItemCount = 0;
      for (const item of itemsRows) {
        totalItemCount += item.quantity;
      }
      order.item_count = totalItemCount;
      
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
        'UPDATE orders SET status = ? WHERE orderID = ?',
        [this.status, this.id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Delete order
  async delete() {
    try {
      const [result] = await pool.execute(
        'DELETE FROM orders WHERE orderID = ?',
        [this.id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Get order count
  static async getCount() {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM orders'
      );
      
      return rows[0].count;
    } catch (error) {
      console.error('Error getting order count:', error);
      throw error;
    }
  }
  // Get orders by user ID
  static async getByUserId(userId) {
    try {
      // First get the orders
      const [orderRows] = await pool.execute(
        'SELECT orderID as id, userID as user_id, totalPrice as total_amount, status as status, orderDate as created_at FROM orders WHERE userID = ? ORDER BY orderDate DESC',
        [userId]
      );
        // If there are no orders, return empty array
      if (orderRows.length === 0) {
        return [];
      }
      
      // For each order, get the total item count accounting for quantities
      for (const order of orderRows) {
        const [countRows] = await pool.execute(
          'SELECT SUM(quantity) as item_count FROM order_items WHERE orderID = ?',
          [order.id]
        );
        order.item_count = countRows[0].item_count || 0; // Use 0 if result is NULL
      }
      
      return orderRows;
    } catch (error) {
      console.error('Error getting orders by user ID:', error);
      throw error;
    }
  }
  // Get order items by order ID
  static async getItemsByOrderId(orderId) {
    try {
      const [rows] = await pool.execute(
        `SELECT oi.orderItemID as id, oi.productID as product_id, 
        p.name as product_name, p.imagePath as product_image,
        oi.quantity, p.price as price
        FROM order_items oi
        LEFT JOIN products p ON oi.productID = p.productID
        WHERE oi.orderID = ?`,
        [orderId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting order items:', error);
      throw error;
    }
  }

  // Get order total amount by order ID
  static async getTotalAmountByOrderId(orderId) {
    try {
      const [rows] = await pool.execute(
        'SELECT totalPrice as total_amount FROM orders WHERE orderID = ?',
        [orderId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0].total_amount;
    } catch (error) {
      console.error('Error getting order total amount:', error);
      throw error;
    }
  }

  // Get order status by order ID
  static async getStatusByOrderId(orderId) {
    try {
      const [rows] = await pool.execute(
        'SELECT status as status FROM orders WHERE orderID = ?',
        [orderId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0].status;
    } catch (error) {
      console.error('Error getting order status:', error);
      throw error;
    }
  }

  // Get order date by order ID
  static async getDateByOrderId(orderId) {
    try {
      const [rows] = await pool.execute(
        'SELECT orderDate as created_at FROM orders WHERE orderID = ?',
        [orderId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0].created_at;
    } catch (error) {
      console.error('Error getting order date:', error);
      throw error;
    }
  }

  // Get order user ID by order ID
  static async getUserIdByOrderId(orderId) {
    try {
      const [rows] = await pool.execute(
        'SELECT userID as user_id FROM orders WHERE orderID = ?',
        [orderId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0].user_id;
    } catch (error) {
      console.error('Error getting order user ID:', error);
      throw error;
    }
  }

  // Get order ID by user ID
  static async getOrderIdByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT orderID as id FROM orders WHERE userID = ?',
        [userId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0].id;
    } catch (error) {
      console.error('Error getting order ID by user ID:', error);
      throw error;
    }
  }
  // Get order items count by order ID
  static async getItemsCountByOrderId(orderId) {
    try {
      const [rows] = await pool.execute(
        'SELECT SUM(quantity) as count FROM order_items WHERE orderID = ?',
        [orderId]
      );
      
      return rows[0].count || 0; // Return 0 if there are no items
    } catch (error) {
      console.error('Error getting order items count:', error);
      throw error;
    }
  }

  // Get order items total amount by order ID
  static async getItemsTotalAmountByOrderId(orderId) {
    try {
      const [rows] = await pool.execute(
        'SELECT SUM(price * quantity) as total_amount FROM order_items WHERE orderID = ?',
        [orderId]
      );
      
      return rows[0].total_amount;
    } catch (error) {
      console.error('Error getting order items total amount:', error);
      throw error;
    }
  }

  // Get order items by user ID
  static async getItemsByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT oi.orderItemID as id, oi.productID as product_id, 
        p.name as product_name, p.imagePath as product_image,
        oi.quantity, p.price as price
        FROM order_items oi
        LEFT JOIN products p ON oi.productID = p.productID
        WHERE oi.userID = ?`,
        [userId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting order items by user ID:', error);
      throw error;
    }
  }
}

module.exports = Order;
