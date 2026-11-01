const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null denotes system-wide broadcast
    },
    title: {
      type: String,
      required: [true, 'Please provide notification title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message'],
    },
    type: {
      type: String,
      enum: ['info', 'alert', 'payment', 'workout', 'membership'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
