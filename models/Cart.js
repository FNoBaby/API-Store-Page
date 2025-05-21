const { pool } = require('../config/db');

class Cart {
  constructor(cartData) {
    this.id = cartData.id;
    this.user_id = cartData.user_id;
    this.items = cartData.items || [];
    this.total_amount = cartData.total_amount || 0;
  }

  // Get cart by user ID
  static async getByUserId(userId) {
    try {
      // Check if cart exists for user
      const [cartRows] = await pool.execute(
        'SELECT id FROM carts WHERE user_id = ? LIMIT 1',
        [userId]
      );
      
      if (cartRows.length === 0) {
        // Create new cart if not exists
        const [result] = await pool.execute(
          'INSERT INTO carts (user_id, created_at) VALUES (?, NOW())',
          [userId]
        );
        
        return new Cart({
          id: result.insertId,
          user_id: userId,
          items: [],
          total_amount: 0
        });
      }
        const cartId = cartRows[0].id;
      
      // Get cart items
      const [itemRows] = await pool.execute(
        `SELECT ci.id, ci.product_id, p.name as product_name, 
        p.imagePath as product_image, p.price as product_price, 
        ci.quantity, (p.price * ci.quantity) as item_total
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.productID
        WHERE ci.cart_id = ?`,
        [cartId]
      );
      
      let totalAmount = 0;
      itemRows.forEach(item => {
        totalAmount += parseFloat(item.item_total);
      });
      
      return new Cart({
        id: cartId,
        user_id: userId,
        items: itemRows,
        total_amount: totalAmount
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  }

  // Add item to cart
  async addItem(productId, quantity) {
    try {
      // Check if product exists
      const [productRows] = await pool.execute(
        'SELECT productID, price FROM products WHERE productID = ? AND active = 1 LIMIT 1',
        [productId]
      );
      
      if (productRows.length === 0) {
        throw new Error('Product not found or inactive');
      }
      
      const product = productRows[0];
      
      // Check if item already in cart
      const [itemRows] = await pool.execute(
        'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
        [this.id, productId]
      );
      
      if (itemRows.length > 0) {
        // Update quantity if item exists
        const newQuantity = itemRows[0].quantity + quantity;
        await pool.execute(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [newQuantity, itemRows[0].id]
        );
      } else {
        // Insert new item if not exists
        await pool.execute(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
          [this.id, productId, quantity]
        );
      }
      
      // Update cache and return updated cart
      return Cart.getByUserId(this.user_id);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateItemQuantity(productId, quantity) {
    try {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }
      
      // Check if item exists in cart
      const [itemRows] = await pool.execute(
        'SELECT id FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
        [this.id, productId]
      );
      
      if (itemRows.length === 0) {
        throw new Error('Item not found in cart');
      }
      
      // Update quantity
      await pool.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [quantity, itemRows[0].id]
      );
      
      // Return updated cart
      return Cart.getByUserId(this.user_id);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeItem(productId) {
    try {
      await pool.execute(
        'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [this.id, productId]
      );
      
      return Cart.getByUserId(this.user_id);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }

  // Clear cart
  async clear() {
    try {
      await pool.execute(
        'DELETE FROM cart_items WHERE cart_id = ?',
        [this.id]
      );
      
      return Cart.getByUserId(this.user_id);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
  // Convert cart to order
  async checkout(deliveryDate = null) {
    try {
      // Get fresh cart data with latest prices
      const cart = await Cart.getByUserId(this.user_id);
      
      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      
      const orderItems = cart.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product_price
      }));
      
      // Create order from cart
      const Order = require('./Order');
      const order = new Order({
        user_id: this.user_id,
        total_amount: cart.total_amount,
        status: 'pending',
        delivery_date: deliveryDate,
        items: orderItems
      });
      
      const orderId = await order.create();
      
      // Clear cart after successful order
      await this.clear();
      
      return orderId;
    } catch (error) {
      console.error('Error checking out cart:', error);
      throw error;
    }
  }
}

// Create tables if they don't exist
async function initializeCartTables() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id)
      )
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cart_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (cart_id),
        INDEX (product_id)
      )
    `);
    
    console.log('Cart tables initialized successfully');
  } catch (error) {
    console.error('Error initializing cart tables:', error);
  }
}

// Initialize tables on module load
initializeCartTables();

module.exports = Cart;
