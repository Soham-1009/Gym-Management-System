const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const MembershipPlan = require('../models/MembershipPlan');

// Dates (e.g. attendance) are stored at local midnight; group in the same timezone
// so MongoDB's UTC-based date operators don't shift every bucket back a day.
const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

const toLocalDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Aggregates revenue by month and by payment method
 */
const getRevenueReport = async (startDate, endDate) => {
  const matchStage = { status: 'paid' };
  if (startDate || endDate) {
    matchStage.paymentDate = {};
    if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
    if (endDate) {
      // Include the entire end day.
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.paymentDate.$lte = end;
    }
  }

  const monthlyRevenue = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: { date: '$paymentDate', timezone: LOCAL_TZ } },
          month: { $month: { date: '$paymentDate', timezone: LOCAL_TZ } },
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const methodBreakdown = await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentMethod',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const totalRevenue = monthlyRevenue.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return {
    totalRevenue,
    monthlyRevenue: monthlyRevenue.map((m) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      amount: m.totalAmount,
      transactions: m.count,
    })),
    methodBreakdown: methodBreakdown.map((b) => ({
      method: b._id,
      amount: b.totalAmount,
      count: b.count,
    })),
  };
};

/**
 * Attendance trends over given days
 */
const getAttendanceReport = async (days = 14) => {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  const trends = await Attendance.aggregate([
    { $match: { date: { $gte: cutoff } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: LOCAL_TZ } },
        presentCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Zero-fill days with no check-ins so trend charts don't silently skip dates.
  const counts = new Map(trends.map((t) => [t._id, t.presentCount]));
  const result = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(cutoff);
    d.setDate(cutoff.getDate() + i);
    const key = toLocalDateKey(d);
    result.push({ date: key, present: counts.get(key) || 0 });
  }
  return result;
};

/**
 * Membership distribution across plans
 */
const getMembershipDistribution = async () => {
  const distribution = await Member.aggregate([
    // Only active subscriptions (the UI labels this "Active subscriptions by tier").
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$membershipPlan',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'membershipplans',
        localField: '_id',
        foreignField: '_id',
        as: 'plan',
      },
    },
    { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        planName: { $ifNull: ['$plan.name', 'No Active Plan'] },
        count: 1,
      },
    },
  ]);

  return distribution;
};

/**
 * Expiry alert report: Members expired or expiring within N days
 */
const getExpiryAlerts = async (withinDays = 7) => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + withinDays);

  const expiringSoon = await Member.find({
    expiryDate: { $gte: now, $lte: future },
    status: 'active',
  })
    .populate('user', 'name email phone')
    .populate('membershipPlan', 'name');

  const alreadyExpired = await Member.find({
    status: 'expired',
  })
    .populate('user', 'name email phone')
    .populate('membershipPlan', 'name')
    .limit(20);

  return {
    expiringSoon,
    alreadyExpired,
  };
};

module.exports = {
  getRevenueReport,
  getAttendanceReport,
  getMembershipDistribution,
  getExpiryAlerts,
};
