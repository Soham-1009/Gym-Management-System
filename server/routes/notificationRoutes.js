const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMyNotifications);
router.post('/', authorize('admin'), createNotification);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;
