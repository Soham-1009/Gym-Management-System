const Progress = require('../models/Progress');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Record new progress entry
// @route   POST /api/progress
// @access  Private
const recordProgress = async (req, res, next) => {
  try {
    let { memberId, date, weightKg, heightCm, measurements, notes } = req.body;

    if (req.user.role === 'member') {
      // Members may only ever record their own progress, regardless of body payload.
      const myMember = await Member.findOne({ user: req.user._id });
      if (!myMember) return errorResponse(res, 404, 'Member record not found');
      memberId = myMember._id;
    }

    if (!memberId || !weightKg || !heightCm) {
      return errorResponse(res, 400, 'Member ID, weight in kg, and height in cm are required');
    }

    const entry = await Progress.create({
      member: memberId,
      date: date || new Date(),
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm),
      measurements: measurements || {},
      notes: notes || '',
      recordedBy: req.user._id,
    });

    const populated = await Progress.findById(entry._id)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('recordedBy', 'name role');

    return successResponse(res, 201, 'Progress recorded successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress history for a member
// @route   GET /api/progress/member/:id
// @access  Private
const getMemberProgressHistory = async (req, res, next) => {
  try {
    if (req.user.role === 'member') {
      const myMember = await Member.findOne({ user: req.user._id });
      if (!myMember || myMember._id.toString() !== req.params.id) {
        return errorResponse(res, 403, 'Access denied. You can only view your own progress history.');
      }
    }

    const history = await Progress.find({ member: req.params.id })
      .populate('recordedBy', 'name role')
      .sort({ date: 1 });

    return successResponse(res, 200, 'Progress history retrieved', history);
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress for logged-in member
// @route   GET /api/progress/my
// @access  Private (Member)
const getMyProgress = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) return errorResponse(res, 404, 'Member record not found');

    const history = await Progress.find({ member: member._id })
      .populate('recordedBy', 'name role')
      .sort({ date: 1 });

    return successResponse(res, 200, 'My progress history retrieved', history);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete progress record
// @route   DELETE /api/progress/:id
// @access  Private (Admin / Trainer)
const deleteProgress = async (req, res, next) => {
  try {
    const entry = await Progress.findById(req.params.id);
    if (!entry) return errorResponse(res, 404, 'Progress entry not found');

    if (req.user.role === 'trainer' && (!entry.recordedBy || entry.recordedBy.toString() !== req.user._id.toString())) {
      return errorResponse(res, 403, 'You are only authorized to delete biometric entries logged by you');
    }

    await Progress.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'Progress entry deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordProgress,
  getMemberProgressHistory,
  getMyProgress,
  deleteProgress,
};
