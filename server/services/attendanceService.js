const Attendance = require('../models/Attendance');

/**
 * Normalizes a date to 00:00:00 UTC/Local start of day
 */
const getNormalizedDate = (d = new Date()) => {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day, 0, 0, 0, 0);
  }
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Checks if attendance is already logged today for a member
 */
const checkExistingAttendance = async (memberId, targetDate = new Date()) => {
  const normalized = getNormalizedDate(targetDate);
  const nextDay = new Date(normalized);
  nextDay.setDate(nextDay.getDate() + 1);

  return await Attendance.findOne({
    member: memberId,
    date: {
      $gte: normalized,
      $lt: nextDay,
    },
  });
};

/**
 * Calculate attendance percentage for a member given total gym open days
 */
const calculateAttendanceStats = async (memberId, daysBack = 30) => {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);

  const presentCount = await Attendance.countDocuments({
    member: memberId,
    date: { $gte: sinceDate },
    status: { $in: ['present', 'late'] },
  });

  const percentage = Math.min(100, Math.round((presentCount / daysBack) * 100));
  return {
    daysBack,
    presentCount,
    percentage,
  };
};

module.exports = {
  getNormalizedDate,
  checkExistingAttendance,
  calculateAttendanceStats,
};
