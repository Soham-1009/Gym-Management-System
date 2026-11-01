const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const User = require('../models/User');
const { getNormalizedDate, checkExistingAttendance, calculateAttendanceStats } = require('../services/attendanceService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Record check-in for a member
// @route   POST /api/attendance/check-in
// @access  Private (Admin / Trainer / Member)
const recordCheckIn = async (req, res, next) => {
  try {
    let { memberId, notes = '' } = req.body;

    // If Member role is checking themselves in
    if (req.user.role === 'member') {
      const myMember = await Member.findOne({ user: req.user._id });
      if (!myMember) {
        return errorResponse(res, 404, 'Member record not found for this user');
      }
      memberId = myMember._id;
    }

    if (!memberId) {
      return errorResponse(res, 400, 'Member ID is required');
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return errorResponse(res, 404, 'Member not found');
    }

    if (member.status !== 'active') {
      return errorResponse(res, 403, 'Cannot check-in: member account is inactive or expired');
    }
    if (member.expiryDate && new Date(member.expiryDate) < new Date()) {
      return errorResponse(res, 403, 'Cannot check-in: member subscription has expired');
    }

    // Check for duplicate attendance on the same day
    const existing = await checkExistingAttendance(memberId, new Date());
    if (existing) {
      return errorResponse(
        res,
        400,
        `Attendance already recorded for this member today at ${new Date(existing.checkInTime).toLocaleTimeString()}`
      );
    }

    const attendance = await Attendance.create({
      member: memberId,
      date: getNormalizedDate(new Date()),
      checkInTime: new Date(),
      status: 'present',
      notes,
    });

    const populated = await Attendance.findById(attendance._id).populate({
      path: 'member',
      populate: { path: 'user', select: 'name email phone' },
    });

    return successResponse(res, 201, 'Check-in recorded successfully', populated);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, 'Attendance already exists for this member on this date.');
    }
    next(error);
  }
};

// @desc    Record check-out for a member
// @route   POST /api/attendance/check-out
// @access  Private (Admin / Trainer / Member)
const recordCheckOut = async (req, res, next) => {
  try {
    let { memberId, attendanceId } = req.body;
    let attendance = null;

    if (attendanceId) {
      attendance = await Attendance.findById(attendanceId);
    } else {
      if (req.user.role === 'member') {
        const myMember = await Member.findOne({ user: req.user._id });
        if (!myMember) return errorResponse(res, 404, 'Member record not found');
        memberId = myMember._id;
      }

      if (!memberId) {
        return errorResponse(res, 400, 'Member ID or Attendance ID is required');
      }

      attendance = await checkExistingAttendance(memberId, new Date());
    }

    if (!attendance) {
      return errorResponse(res, 404, 'No active check-in found for this member today.');
    }

    if (attendance.checkOutTime) {
      return errorResponse(res, 400, 'Member has already checked out today.');
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    const populated = await Attendance.findById(attendance._id).populate({
      path: 'member',
      populate: { path: 'user', select: 'name email phone' },
    });

    return successResponse(res, 200, 'Check-out recorded successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily attendance list or filtered by date and member
// @route   GET /api/attendance
// @access  Private (Admin / Trainer)
const getDailyAttendance = async (req, res, next) => {
  try {
    const { date, memberId, status, search, limit = 100 } = req.query;
    let query = {};

    if (date) {
      const target = getNormalizedDate(new Date(date));
      const nextDay = new Date(target);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: target, $lt: nextDay };
    }

    if (memberId) {
      query.member = memberId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const userMatches = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const memberMatches = await Member.find({ user: { $in: userMatches.map((u) => u._id) } }).select('_id');
      query.member = { $in: memberMatches.map((m) => m._id) };
    }

    const records = await Attendance.find(query)
      .populate({
        path: 'member',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'membershipPlan', select: 'name' },
        ],
      })
      .sort({ checkInTime: -1 })
      .limit(Math.min(parseInt(limit, 10) || 100, 500));

    return successResponse(res, 200, 'Attendance list retrieved', records);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for logged-in member
// @route   GET /api/attendance/my
// @access  Private (Member)
const getMyAttendance = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) {
      return errorResponse(res, 404, 'Member record not found');
    }

    const records = await Attendance.find({ member: member._id }).sort({ date: -1 });
    const stats = await calculateAttendanceStats(member._id, 30);

    return successResponse(res, 200, 'My attendance retrieved', {
      stats,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return errorResponse(res, 404, 'Attendance record not found');
    return successResponse(res, 200, 'Attendance record deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordCheckIn,
  recordCheckOut,
  getDailyAttendance,
  getMyAttendance,
  deleteAttendance,
};
