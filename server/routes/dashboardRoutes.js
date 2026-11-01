const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getTrainerDashboardStats,
  getMemberDashboardStats,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/admin', authorize('admin'), getAdminDashboardStats);
router.get('/trainer', authorize('trainer', 'admin'), getTrainerDashboardStats);
router.get('/member', authorize('member', 'admin', 'trainer'), getMemberDashboardStats);

module.exports = router;
