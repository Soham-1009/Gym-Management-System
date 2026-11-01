const {
  getRevenueReport,
  getAttendanceReport,
  getMembershipDistribution,
  getExpiryAlerts,
} = require('../services/reportService');
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const { successResponse } = require('../utils/responseHandler');

// @desc    Get aggregated reports for dashboard & analytics
// @route   GET /api/reports/analytics
// @access  Private/Admin
const getAnalyticsReport = async (req, res, next) => {
  try {
    const { startDate, endDate, days = 14 } = req.query;
    const parsedDays = parseInt(days, 10);
    const safeDays = Number.isFinite(parsedDays) ? Math.min(Math.max(parsedDays, 1), 365) : 14;

    const [revenueData, attendanceData, distributionData, expiryAlerts] = await Promise.all([
      getRevenueReport(startDate, endDate),
      getAttendanceReport(safeDays),
      getMembershipDistribution(),
      getExpiryAlerts(7),
    ]);

    // Member growth by month
    const memberGrowth = await Member.aggregate([
      { $match: { joinDate: { $ne: null, $exists: true } } },
      {
        $group: {
          _id: {
            year: { $year: '$joinDate' },
            month: { $month: '$joinDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return successResponse(res, 200, 'Analytics report retrieved', {
      revenue: revenueData,
      attendanceTrends: attendanceData,
      membershipDistribution: distributionData,
      expiryAlerts,
      memberGrowth: memberGrowth.map((g) => ({
        month: `${g._id.year}-${String(g._id.month).padStart(2, '0')}`,
        newMembers: g.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed printable reports with date filters
// @route   GET /api/reports/export
// @access  Private/Admin
const getExportReport = async (req, res, next) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    let data = {};

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    if (reportType === 'payments' || !reportType) {
      const q = {};
      if (startDate || endDate) q.paymentDate = dateFilter;
      data.payments = await Payment.find(q)
        .populate({
          path: 'member',
          populate: { path: 'user', select: 'name email phone' },
        })
        .populate('membershipPlan', 'name price');
    }

    if (reportType === 'members' || !reportType) {
      const q = {};
      if (startDate || endDate) q.joinDate = dateFilter;
      data.members = await Member.find(q)
        .populate('user', 'name email phone')
        .populate('membershipPlan', 'name');
    }

    return successResponse(res, 200, 'Export report generated', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsReport,
  getExportReport,
};
