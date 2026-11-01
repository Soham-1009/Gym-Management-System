const express = require('express');
const router = express.Router();
const {
  recordCheckIn,
  recordCheckOut,
  getDailyAttendance,
  getMyAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/check-in', recordCheckIn);
router.post('/check-out', recordCheckOut);
router.get('/my', authorize('member', 'admin', 'trainer'), getMyAttendance);
router.get('/', authorize('admin', 'trainer'), getDailyAttendance);
router.delete('/:id', authorize('admin'), deleteAttendance);

module.exports = router;
