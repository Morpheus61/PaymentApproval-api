const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Create a new user
router.post('/', auth, async (req, res) => {
  try {
    const { username, password, email, fullName, role, department } = req.body;

    // Validate required fields
    if (!username || !password || !email || !fullName || !role || !department) {
      return res.status(400).json({ 
        message: 'All fields are required',
        details: {
          username: !username ? 'Username is required' : null,
          password: !password ? 'Password is required' : null,
          email: !email ? 'Email is required' : null,
          fullName: !fullName ? 'Full Name is required' : null,
          role: !role ? 'Role is required' : null,
          department: !department ? 'Department is required' : null
        }
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists',
        details: {
          username: existingUser.username === username.toLowerCase() ? 'Username already taken' : null,
          email: existingUser.email === email.toLowerCase() ? 'Email already in use' : null
        }
      });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      email: email.toLowerCase(),
      fullName,
      role,
      department
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('User creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

module.exports = router;
