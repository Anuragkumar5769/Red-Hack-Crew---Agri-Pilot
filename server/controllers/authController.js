import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    console.log('📝 Signup request received:', { 
      firstName: req.body.firstName, 
      lastName: req.body.lastName, 
      email: req.body.email, 
      phone: req.body.phone 
    });
    
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user already exists
    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email === email ? 'Email' : 'Phone');
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
    }

    // Create new user
    console.log('✅ Creating new user...');
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    console.log('✅ User registered successfully:', user._id);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    console.log('🔐 Login request received:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    console.log('🔍 Looking for user with email:', email);
    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    console.log('✅ User found, checking password...');
    // Check password
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      console.log('❌ Incorrect password');
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }

    console.log('✅ Password correct, updating last login...');
    // Update last login - use findByIdAndUpdate to avoid password hashing issues
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    console.log('✅ Generating token...');
    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    console.log('✅ Login successful for user:', user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
