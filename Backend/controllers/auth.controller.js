import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user by email (username) or phone number
    const user = await User.findOne({
      $or: [
        { email: username },
        { phoneNumber: username }
      ]
    }).populate('clientId', 'client ownerName');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check if user is not a customer (customers don't have passwords)
    if (user.role === 'customer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.cookie('userId', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Map role to frontend format
    let frontendRole;
    switch (user.role) {
      case 'super_admin':
        frontendRole = 'super-admin';
        break;
      case 'admin':
        frontendRole = 'admin';
        break;
      default:
        frontendRole = 'staff';
    }

    // Return user data
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id.toString(),
        username: user.email,
        ownerName: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: frontendRole,
        client: user.clientId ? user.clientId.client : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('userId');

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('clientId', 'client ownerName')
      .select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Map role to frontend format
    let frontendRole;
    switch (user.role) {
      case 'super_admin':
        frontendRole = 'super-admin';
        break;
      case 'admin':
        frontendRole = 'admin';
        break;
      default:
        frontendRole = 'staff';
    }

    res.json({
      success: true,
      data: {
        id: user._id.toString(),
        username: user.email,
        ownerName: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: frontendRole,
        client: user.clientId ? user.clientId.client : null
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
