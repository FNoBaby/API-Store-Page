const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { DEFAULT_PROFILE_FILENAME } = require('../utils/constants');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.surname = userData.surname;
    this.email = userData.email;
    this.phone = userData.phone;
    this.password = userData.password;
    this.profileImage = userData.profileImage || DEFAULT_PROFILE_FILENAME;
    this.role = userData.role || 'customer';
  }

  // Register a new user
  async register() {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      
      const query = `
        INSERT INTO users (name, surname, email, phone, passwordHash, profileImage, role, registrationDate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const [result] = await pool.execute(query, [
        this.name,
        this.surname,
        this.email,
        this.phone,
        hashedPassword,
        this.profileImage,
        this.role
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error in user registration:', error);
      throw error;
    }
  }

  // Check if email exists
  static async emailExists(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT userID FROM users WHERE email = ? LIMIT 1',
        [email]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  // Check if phone exists
  static async phoneExists(phone) {
    try {
      const [rows] = await pool.execute(
        'SELECT userID FROM users WHERE phone = ? LIMIT 1',
        [phone]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking phone existence:', error);
      throw error;
    }
  }

  // Login user with email or phone
  static async login(loginId, password) {
    try {
      const [rows] = await pool.execute(
        'SELECT userID, name, surname, email, phone, passwordHash, profileImage, role FROM users WHERE email = ? OR phone = ? LIMIT 1',
        [loginId, loginId]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      
      if (!isMatch) {
        return null;
      }
      
      return {
        id: user.userID,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role
      };
    } catch (error) {
      console.error('Error in user login:', error);
      throw error;
    }
  }

  // Get user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT userID, name, surname, email, phone, profileImage, role FROM users WHERE userID = ? LIMIT 1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const userData = rows[0];
      return {
        id: userData.userID,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        role: userData.role
      };
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Update user profile
  async update() {
    try {
      const query = `
        UPDATE users 
        SET name = ?, surname = ?, email = ?, phone = ?, profileImage = ?
        WHERE userID = ?
      `;
      
      const [result] = await pool.execute(query, [
        this.name,
        this.surname,
        this.email,
        this.phone,
        this.profileImage,
        this.id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Update password
  async updatePassword() {
    try {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      
      const [result] = await pool.execute(
        'UPDATE users SET passwordHash = ? WHERE userID = ?',
        [hashedPassword, this.id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Delete user account
  async delete() {
    try {
      // Check if this is the only admin account
      if (this.role === 'admin') {
        const [rows] = await pool.execute(
          'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
        );
        
        if (rows[0].count <= 1) {
          throw new Error('Cannot delete the only admin account');
        }
      }
      
      // Use a transaction to ensure all operations succeed or fail together
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Delete user's orders first (since they have foreign key constraints)
        await connection.execute('DELETE FROM orders WHERE userID = ?', [this.id]);
        
        // Now delete the user
        const [result] = await connection.execute(
          'DELETE FROM users WHERE userID = ?',
          [this.id]
        );
        
        await connection.commit();
        connection.release();
        
        return result.affectedRows > 0;
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT userID as id, name, surname, email, phone, profileImage, role FROM users'
      );
      
      return rows.map(user => ({
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT userID as id, name, surname, email, phone, profileImage, role FROM users WHERE email = ? LIMIT 1',
        [email]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const userData = rows[0];
      return {
        id: userData.id,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        role: userData.role
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Get user by phone
  static async findByPhone(phone) {
    try {
      const [rows] = await pool.execute(
        'SELECT userID as id, name, surname, email, phone, profileImage, role FROM users WHERE phone = ? LIMIT 1',
        [phone]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const userData = rows[0];
      return {
        id: userData.id,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        role: userData.role
      };
    } catch (error) {
      console.error('Error finding user by phone:', error);
      throw error;
    }
  }

  // Get user by ID with orders
  static async findByIdWithOrders(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT u.userID as id, u.name, u.surname, u.email, u.phone, 
        u.profileImage, u.role, o.orderID as order_id, o.totalAmount as total_amount
        FROM users u
        LEFT JOIN orders o ON u.userID = o.userID
        WHERE u.userID = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const userData = rows[0];
      return {
        id: userData.id,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        role: userData.role,
        orders: rows.map(row => ({
          orderId: row.order_id,
          totalAmount: row.total_amount
        }))
      };
    } catch (error) {
      console.error('Error finding user by ID with orders:', error);
      throw error;
    }
  }

  // Get user by ID with cart
  static async findByIdWithCart(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT u.userID as id, u.name, u.surname, u.email, u.phone, 
        u.profileImage, u.role, c.id as cart_id, c.totalAmount as total_amount
        FROM users u
        LEFT JOIN carts c ON u.userID = c.user_id
        WHERE u.userID = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const userData = rows[0];
      return {
        id: userData.id,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        role: userData.role,
        cart: {
          cartId: userData.cart_id,
          totalAmount: userData.total_amount
        }
      };
    } catch (error) {
      console.error('Error finding user by ID with cart:', error);
      throw error;
    }
  }

  // Get user by ID with orders and cart
  static async findByIdWithOrdersAndCart(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT u.userID as id, u.name, u.surname, u.email, u.phone, 
        u.profileImage, u.role, o.orderID as order_id, o.totalAmount as total_amount,
        c.id as cart_id, c.totalAmount as cart_total_amount
        FROM users u
        LEFT JOIN orders o ON u.userID = o.userID
        LEFT JOIN carts c ON u.userID = c.user_id
        WHERE u.userID = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const userData = rows[0];
      return {
        id: userData.id,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        role: userData.role,
        orders: rows.map(row => ({
          orderId: row.order_id,
          totalAmount: row.total_amount
        })),
        cart: {
          cartId: userData.cart_id,
          totalAmount: userData.cart_total_amount
        }
      };
    } catch (error) {
      console.error('Error finding user by ID with orders and cart:', error);
      throw error;
    }
  }

  // Get user by ID with orders and cart and products
  static async findByIdWithOrdersAndCartAndProducts(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT u.userID as id, u.name, u.surname, u.email, u.phone, 
        u.profileImage, u.role, o.orderID as order_id, o.totalAmount as total_amount,
        c.id as cart_id, c.totalAmount as cart_total_amount,
        p.productID as product_id, p.name as product_name
        FROM users u
        LEFT JOIN orders o ON u.userID = o.userID
        LEFT JOIN carts c ON u.userID = c.user_id
        LEFT JOIN products p ON o.productID = p.productID
        WHERE u.userID = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const userData = rows[0];
      return {
        id: userData.id,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        phone: userData.phone,
        profileImage: userData.profileImage,
        role: userData.role,
        orders: rows.map(row => ({
          orderId: row.order_id,
          totalAmount: row.total_amount
        })),
        cart: {
          cartId: userData.cart_id,
          totalAmount: userData.cart_total_amount
        },
        products: rows.map(row => ({
          productId: row.product_id,
          productName: row.product_name
        }))
      };
    } catch (error) {
      console.error('Error finding user by ID with orders and cart and products:', error);
      throw error;
    }
  }
}

module.exports = User;
