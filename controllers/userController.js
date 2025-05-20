const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Get all users and convert to array of user objects
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error retrieving user' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, surname, email, phone } = req.body;
    
    // Make sure we're updating the authenticated user
    const userToUpdate = new User({
      id: req.user.id,
      name,
      surname,
      email,
      phone,
      profileImage: req.file ? req.file.filename : req.user.profileImage
    });
    
    // Check email uniqueness if changed
    if (email !== req.user.email) {
      const emailExists = await User.emailExists(email);
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }
    
    // Check phone uniqueness if changed
    if (phone !== req.user.phone) {
      const phoneExists = await User.phoneExists(phone);
      if (phoneExists) {
        return res.status(400).json({ message: 'Phone number is already in use' });
      }
    }
    
    const updated = await userToUpdate.update();
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update profile' });
    }
    
    // Get updated user data
    const updatedUser = await User.findById(req.user.id);
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const user = await User.login(req.user.email, currentPassword);
    
    if (!user) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    const userToUpdate = new User({
      id: req.user.id,
      password: newPassword
    });
    
    const updated = await userToUpdate.updatePassword();
    
    if (!updated) {
      return res.status(400).json({ message: 'Failed to update password' });
    }
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error updating password' });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userToDelete = new User({
      id: req.user.id,
      role: req.user.role
    });
    
    const deleted = await userToDelete.delete();
    
    if (!deleted) {
      return res.status(400).json({ message: 'Failed to delete account' });
    }
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    
    if (error.message === 'Cannot delete the only admin account') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error deleting account' });
  }
};
