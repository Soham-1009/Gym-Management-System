const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee duplicate attendance prevention for same member on same day
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
