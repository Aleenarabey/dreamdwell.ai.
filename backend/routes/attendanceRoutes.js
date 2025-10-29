import express from 'express';
import Attendance from '../models/Attendance.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mark attendance (present/absent)
router.post('/mark', verifyToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const userId = req.user.id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if attendance already marked for today
    let attendance = await Attendance.findOne({
      userId,
      date: today
    });
    
    if (attendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today'
      });
    }
    
    // Create new attendance record
    attendance = new Attendance({
      userId,
      date: today,
      status: status || 'present',
      notes
    });
    
    await attendance.save();
    
    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
});

// Check in
router.post('/checkin', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let attendance = await Attendance.findOne({
      userId,
      date: today
    });
    
    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }
    
    if (!attendance) {
      // Create attendance record if it doesn't exist
      attendance = new Attendance({
        userId,
        date: today,
        status: 'present',
        checkIn: new Date()
      });
    } else {
      attendance.checkIn = new Date();
      attendance.status = 'present';
    }
    
    await attendance.save();
    
    res.json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking in',
      error: error.message
    });
  }
});

// Check out
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      userId,
      date: today
    });
    
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Please check in first'
      });
    }
    
    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }
    
    attendance.checkOut = new Date();
    attendance.calculateWorkHours();
    
    await attendance.save();
    
    res.json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking out',
      error: error.message
    });
  }
});

// Get attendance for a user
router.get('/my-attendance', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    let query = { userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(30);
    
    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
});

// Get today's attendance status
router.get('/today', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      userId,
      date: today
    });
    
    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
});

// Auto-mark absent for cutoff time (to be called by cron job)
router.post('/auto-mark-absent', async (req, res) => {
  try {
    const { cutoffTime } = req.body;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse cutoff time (e.g., "10:00")
    const [hours, minutes] = cutoffTime.split(':').map(Number);
    const cutoffDateTime = new Date(today);
    cutoffDateTime.setHours(hours, minutes, 0, 0);
    
    // Mark all users as absent who haven't checked in before cutoff
    const now = new Date();
    
    // Get all users (engineers)
    const User = (await import('../models/User.js')).default;
    const engineers = await User.find({ role: 'engineer' });
    
    let markedCount = 0;
    
    for (const engineer of engineers) {
      const attendance = await Attendance.findOne({
        userId: engineer._id,
        date: today
      });
      
      // If no attendance record exists or checkIn is null, mark as absent
      if (!attendance || !attendance.checkIn) {
        // Only auto-mark if cutoff time has passed
        if (now > cutoffDateTime) {
          if (attendance) {
            attendance.status = 'absent';
            await attendance.save();
          } else {
            await Attendance.create({
              userId: engineer._id,
              date: today,
              status: 'absent',
              markedAt: now
            });
          }
          markedCount++;
        }
      }
    }
    
    res.json({
      success: true,
      message: `Auto-marked ${markedCount} users as absent`,
      markedCount
    });
  } catch (error) {
    console.error('Error auto-marking absent:', error);
    res.status(500).json({
      success: false,
      message: 'Error auto-marking absent',
      error: error.message
    });
  }
});

// Get attendance stats for a user
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find({
      userId,
      ...dateQuery
    });
    
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      halfDay: attendance.filter(a => a.status === 'half_day').length,
      leave: attendance.filter(a => a.status === 'leave').length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance stats',
      error: error.message
    });
  }
});

export default router;

