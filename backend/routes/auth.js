/**
 * Authentication Routes
 * This module handles user authentication using Google OAuth2.0 and manages user sessions
 * through JWT tokens. It also provides endpoints for user data retrieval.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');
const { setCache, getCache } = require('../config/redisUtils');

// JWT secret for token signing - uses environment variable or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'utracker_default_secret_key';

// Initialize Google OAuth client with client ID from environment variables
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST api/auth/google
 * @desc    Authenticate user with Google credentials and return JWT token
 * @access  Public
 * @param   {Object} req.body.tokenId - Google OAuth token ID
 * @param   {Object} req.body.userData - User data from frontend (alternative to tokenId)
 * @returns {Object} { token, user } - JWT token and user data
 */
router.post('/google', async (req, res) => {
  const { tokenId, userData } = req.body;
  
  try {
    let email, name, picture;
    
    // Handle authentication either through direct user data or Google token verification
    if (userData && userData.email) {
      ({ email, name, picture } = { 
        email: userData.email,
        name: userData.name,
        picture: userData.picture
      });
    } 
    else if (tokenId) {
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      ({ name, email, picture } = ticket.getPayload());
    } else {
      return res.status(400).json({ msg: 'No valid authentication data provided' });
    }

    // Find existing user or create new one
    let user = await User.findOne({ email });

    if (!user) {
      // Initialize new user with default settings
      user = new User({
        name,
        email,
        avatar: picture,
        categories: ['Uncategorized'],
        dailyGoal: ''
      });
      await user.save();
    } else if (user.avatar !== picture) {
      // Update user's avatar if it has changed
      user.avatar = picture;
      await user.save();
    }

    // Create JWT payload with user ID
    const payload = {
      user: {
        id: user.id
      }
    };

    // Generate and return JWT token along with user data
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      async (err, token) => {
        if (err) throw err;
        
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          categories: user.categories,
          dailyGoal: user.dailyGoal
        };
        
        // Cache user data for faster subsequent retrievals
        await setCache(`user:${user.id}`, userData, 86400); // Cache for 24 hours
        
        res.json({
          token,
          user: userData
        });
      }
    );
  } catch (err) {
    console.error('Error in Google authentication:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @route   GET api/auth/user
 * @desc    Retrieve authenticated user's data
 * @access  Private - Requires valid JWT token
 * @returns {Object} User data excluding version field
 */
router.get('/user', authenticateToken, async (req, res) => {
  try {
    // Attempt to retrieve user data from cache first
    const cachedUser = await getCache(`user:${req.user.id}`);
    
    if (cachedUser) {
      return res.json(cachedUser);
    }
    
    // If not in cache, fetch from database
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Cache user data for future requests
    await setCache(`user:${user.id}`, user.toObject(), 86400); // Cache for 24 hours
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 