const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const WorkoutPlan = require('../models/WorkoutPlan');
const Progress = require('../models/Progress');
const { getNormalizedDate, calculateAttendanceStats } = require('../services/attendanceService');
const {
  getRevenueReport,
  getAttendanceReport,
  getMembershipDistribution,
  getExpiryAlerts,
} = require('../services/reportService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get aggregated stats & charts for Admin Dashboard
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const today = getNormalizedDate(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      totalTrainers,
      todayAttendanceCount,
      monthlyRevenueData,
      pendingPaymentsCount,
      recentRegistrations,
      recentPayments,
      expiryAlerts,
      attendanceTrends,
      membershipDistribution,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
      Member.countDocuments({ status: 'expired' }),
      Trainer.countDocuments({ status: 'active' }),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Payment.aggregate([
        { $match: { status: 'paid', paymentDate: { $gte: firstDayOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.countDocuments({ status: 'pending' }),
      Member.find()
        .populate('user', 'name email phone avatar createdAt')
        .populate('membershipPlan', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      Payment.find()
        .populate({
          path: 'member',
          populate: { path: 'user', select: 'name email avatar' },
        })
        .populate('membershipPlan', 'name')
        .sort({ paymentDate: -1 })
        .limit(5),
      getExpiryAlerts(7),
      getAttendanceReport(14),
      getMembershipDistribution(),
    ]);

    const monthlyRevenue = monthlyRevenueData.length > 0 ? monthlyRevenueData[0].total : 0;
    const fullRevenueReport = await getRevenueReport();

    return successResponse(res, 200, 'Admin dashboard stats retrieved', {
      kpis: {
        totalMembers,
        activeMembers,
        expiredMembers,
        totalTrainers,
        todayAttendance: todayAttendanceCount,
        monthlyRevenue,
        pendingPayments: pendingPaymentsCount,
        expiringSoonCount: expiryAlerts.expiringSoon.length,
      },
      charts: {
        monthlyRevenue: fullRevenueReport.monthlyRevenue,
        attendanceTrends,
        membershipDistribution,
      },
      recentRegistrations,
      recentPayments,
      expiryAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats for logged-in Trainer
// @route   GET /api/dashboard/trainer
// @access  Private/Trainer
const getTrainerDashboardStats = async (req, res, next) => {
  try {
    let trainer = await Trainer.findOne({ user: req.user._id });
    if (!trainer) {
      trainer = await Trainer.create({
        user: req.user._id,
        specialization: 'General Fitness',
        experienceYears: 1,
        phone: req.user.phone || '',
        bio: 'Certified Fitness Professional',
      });
    }

    const assignedMembers = await Member.find({ trainer: trainer._id })
      .populate('user', 'name email phone avatar')
      .populate('membershipPlan', 'name');

    const assignedMemberIds = assignedMembers.map((m) => m._id);

    const today = getNormalizedDate(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAttendedCount, activeWorkoutPlans] = await Promise.all([
      Attendance.countDocuments({
        member: { $in: assignedMemberIds },
        date: { $gte: today, $lt: tomorrow },
      }),
      WorkoutPlan.find({ trainer: trainer._id, isActive: true })
        .populate({
          path: 'member',
          populate: { path: 'user', select: 'name email' },
        })
        .sort({ updatedAt: -1 }),
    ]);

    return successResponse(res, 200, 'Trainer dashboard stats retrieved', {
      totalAssignedMembers: assignedMembers.length,
      todayAttendedMembers: todayAttendedCount,
      activeWorkoutPlansCount: activeWorkoutPlans.length,
      assignedMembers,
      activeWorkoutPlans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats for logged-in Member
// @route   GET /api/dashboard/member
// @access  Private/Member
const getMemberDashboardStats = async (req, res, next) => {
  try {
    let member = await Member.findOne({ user: req.user._id })
      .populate('user', 'name email phone avatar')
      .populate('membershipPlan')
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'name email phone avatar specialization' },
      });

    if (!member) {
      if (req.user.role === 'member') {
        member = await Member.create({
          user: req.user._id,
          joinDate: new Date(),
          status: 'active',
        });
        member = await Member.findById(member._id).populate('user', 'name email phone avatar');
      } else {
        return errorResponse(res, 404, 'Member record not found for this account');
      }
    }

    member.updateStatusBasedOnExpiry();
    await member.save();

    let daysRemaining = 0;
    if (member.expiryDate) {
      const diff = new Date(member.expiryDate) - new Date();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    const [attendanceStats, recentAttendance, workoutPlans, progressHistory] = await Promise.all([
      calculateAttendanceStats(member._id, 30),
      Attendance.find({ member: member._id }).sort({ date: -1 }).limit(7),
      WorkoutPlan.find({ member: member._id, isActive: true })
        .populate({
          path: 'trainer',
          populate: { path: 'user', select: 'name' },
        })
        .sort({ createdAt: -1 }),
      Progress.find({ member: member._id }).sort({ date: -1 }).limit(10),
    ]);

    const latestProgress = progressHistory.length > 0 ? progressHistory[0] : null;

    return successResponse(res, 200, 'Member dashboard stats retrieved', {
      member,
      daysRemaining,
      attendanceStats,
      recentAttendance,
      activeWorkoutPlan: workoutPlans.length > 0 ? workoutPlans[0] : null,
      latestProgress,
      progressHistory: [...progressHistory].reverse(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getTrainerDashboardStats,
  getMemberDashboardStats,
};
