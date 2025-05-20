const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Register a new user
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, surname, email, phone, password, role = 'customer' } = req.body;
    
    // Check if email already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    
    // Check if phone already exists
    const phoneExists = await User.phoneExists(phone);
    if (phoneExists) {
      return res.status(400).json({ message: 'Phone number is already registered' });
    }
    
    // Create and save new user
    const user = new User({
      name,
      surname,
      email,
      phone,
      password,
      role
    });
    
    const userId = await user.register();
    
    // Get the registered user
    const registeredUser = await User.findById(userId);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: registeredUser.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: registeredUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { loginId, password } = req.body;
    
    // Login using email or phone
    const user = await User.login(loginId, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by the auth middleware
    res.json(req.user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error retrieving user profile' });
  }
};
