const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get user notifications (including global broadcasts)
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipient: null }],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return successResponse(res, 200, 'Notifications retrieved', notifications, {
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new notification / broadcast
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res, next) => {
  try {
    const { recipient, title, message, type = 'info' } = req.body;
    if (!title || !message) {
      return errorResponse(res, 400, 'Title and message are required');
    }

    const notification = await Notification.create({
      recipient: recipient || null,
      title,
      message,
      type,
    });

    return successResponse(res, 201, 'Notification created successfully', notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return errorResponse(res, 404, 'Notification not found');

    if (
      notification.recipient &&
      notification.recipient.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return errorResponse(res, 403, 'Not authorized to update this notification');
    }

    notification.isRead = true;
    await notification.save();
    return successResponse(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    // Only mark user-specific notifications as read so global announcements remain visible for other users.
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
};
