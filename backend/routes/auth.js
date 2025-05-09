const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// Register (admin only)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Only allow admin registration
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Only admin registration is allowed' });
    }
    
    // Check if maximum number of admin accounts reached
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount >= 2) {
      return res.status(403).json({ error: 'Maximum number of admin accounts (2) reached' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// Get all teachers (admin only)
router.get('/teachers', auth, checkRole(['admin']), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create teacher account (admin only)
router.post('/teachers', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const teacher = new User({
      name,
      email,
      password,
      role: 'teacher'
    });
    
    await teacher.save();
    const teacherResponse = teacher.toObject();
    delete teacherResponse.password;
    
    res.status(201).json(teacherResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update teacher account (admin only)
router.put('/teachers/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (email !== teacher.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    teacher.name = name;
    teacher.email = email;
    if (password) {
      teacher.password = password;
    }
    
    await teacher.save();
    const teacherResponse = teacher.toObject();
    delete teacherResponse.password;
    
    res.json(teacherResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete teacher account (admin only)
router.delete('/teachers/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const teacher = await User.findOneAndDelete({ _id: req.params.id, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if admin exists and count
router.get('/check-admin', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    res.json({ 
      exists: adminCount > 0,
      count: adminCount,
      maxReached: adminCount >= 2
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 