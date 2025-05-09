const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { auth, checkRole } = require('../middleware/auth');

// Get all students
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find().select('-email'); // Explicitly exclude email field
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new student (admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, studentId, class: studentClass } = req.body;
    
    // Check for existing student with same ID
    const existingStudent = await Student.findOne({ studentId });
    
    if (existingStudent) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }

    const student = new Student({ 
      name, 
      studentId, 
      class: studentClass 
    });

    // Remove any email field that might be present
    student.email = undefined;
    
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update student (admin only)
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, studentId, class: studentClass } = req.body;
    
    // First find the student to update
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if new studentId already exists in other students
    if (studentId !== student.studentId) {
      const existingStudent = await Student.findOne({
        studentId,
        _id: { $ne: req.params.id }
      });
      
      if (existingStudent) {
        return res.status(400).json({ error: 'Student ID already exists' });
      }
    }

    // Update student information
    student.name = name;
    student.studentId = studentId;
    student.class = studentClass;
    student.email = undefined; // Ensure email is removed
    
    await student.save();
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete student (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 