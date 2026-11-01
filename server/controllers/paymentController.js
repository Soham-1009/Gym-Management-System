const Payment = require('../models/Payment');
const Member = require('../models/Member');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const { calculateExpiryDate } = require('../services/membershipService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validatePayment } = require('../validators/paymentValidator');

// @desc    Get all payments with filters
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res, next) => {
  try {
    const { status, paymentMethod, startDate, endDate, search, limit = 200 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        // Include the entire end day (date-only strings parse as midnight).
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = end;
      }
    }

    if (search) {
      const userMatches = await User.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id');
      const memberMatches = await Member.find({ user: { $in: userMatches.map((u) => u._id) } }).select('_id');

      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { member: { $in: memberMatches.map((m) => m._id) } },
      ];
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate('membershipPlan', 'name durationMonths price')
      .sort({ paymentDate: -1 })
      .limit(Math.min(parseInt(limit, 10) || 200, 1000));

    const totalCollected = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return successResponse(res, 200, 'Payments retrieved', payments, {
      totalCount: payments.length,
      totalCollected,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by ID / Invoice view
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone address' },
      })
      .populate('membershipPlan');

    if (!payment) {
      return errorResponse(res, 404, 'Payment record not found');
    }

    if (req.user.role === 'member') {
      const myMember = await Member.findOne({ user: req.user._id });
      const ownerId = payment.member && (payment.member._id || payment.member).toString();
      if (!myMember || ownerId !== myMember._id.toString()) {
        return errorResponse(res, 403, 'Access denied. You can only view your own payments.');
      }
    }

    return successResponse(res, 200, 'Payment details retrieved', payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Record new payment & optionally renew membership
// @route   POST /api/payments
// @access  Private/Admin
const recordPayment = async (req, res, next) => {
  try {
    const { isValid, errors } = validatePayment(req.body);
    if (!isValid) {
      return errorResponse(res, 400, 'Validation failed', errors);
    }

    const {
      member: memberId,
      membershipPlan: planId,
      amount,
      paymentMethod = 'cash',
      paymentDate = new Date(),
      status = 'paid',
      notes = '',
      transactionId,
    } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return errorResponse(res, 404, 'Member not found');
    }

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return errorResponse(res, 404, 'Membership plan not found');
    }

    const payment = await Payment.create({
      member: memberId,
      membershipPlan: planId,
      amount: parseFloat(amount),
      paymentMethod,
      paymentDate,
      status,
      notes,
      ...(transactionId && { transactionId }),
    });

    // If payment is marked as 'paid', automatically sync/renew member's membership plan & expiry date!
    if (status === 'paid') {
      const hasRemainingTime = member.expiryDate && new Date(member.expiryDate) > new Date();
      const start = hasRemainingTime ? new Date(member.expiryDate) : new Date(paymentDate);
      const expiry = calculateExpiryDate(start, plan.durationMonths);
      member.membershipPlan = plan._id;
      if (!hasRemainingTime) member.startDate = new Date(paymentDate);
      member.expiryDate = expiry;
      member.status = 'active';
      await member.save();
    }

    const populated = await Payment.findById(payment._id)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('membershipPlan');

    return successResponse(res, 201, 'Payment recorded successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payments for logged-in member
// @route   GET /api/payments/my
// @access  Private (Member)
const getMyPayments = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) {
      return errorResponse(res, 404, 'Member record not found');
    }

    const payments = await Payment.find({ member: member._id })
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('membershipPlan', 'name durationMonths price')
      .sort({ paymentDate: -1 });

    return successResponse(res, 200, 'My payment history retrieved', payments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  recordPayment,
  getMyPayments,
};
