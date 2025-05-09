const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { auth, checkRole } = require('../middleware/auth');

// Submit attendance (teacher only)
router.post('/submit', auth, checkRole(['teacher']), async (req, res) => {
  try {
    const { date, attendanceData } = req.body;
    
    // attendanceData should be an array of { studentId, status }
    const attendanceRecords = await Promise.all(
      attendanceData.map(async ({ studentId, status }) => {
        const student = await Student.findOne({ studentId });
        if (!student) {
          throw new Error(`Student with ID ${studentId} not found`);
        }

        return new Attendance({
          student: student._id,
          date: new Date(date),
          status,
          markedBy: req.user._id
        });
      })
    );

    await Attendance.insertMany(attendanceRecords, { ordered: false });
    res.status(201).json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get attendance report for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .populate('markedBy', 'name');

    const report = {
      student: {
        name: student.name,
        studentId: student.studentId,
        class: student.class
      },
      attendance: attendance.map(record => ({
        date: record.date,
        status: record.status,
        markedBy: record.markedBy.name
      })),
      summary: {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length
      }
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students with their attendance summary
router.get('/summary', auth, async (req, res) => {
  try {
    const students = await Student.find();
    const summary = await Promise.all(
      students.map(async (student) => {
        const attendance = await Attendance.find({ student: student._id });
        return {
          student: {
            _id: student._id,
            name: student.name,
            studentId: student.studentId,
            class: student.class
          },
          summary: {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length
          }
        };
      })
    );

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 