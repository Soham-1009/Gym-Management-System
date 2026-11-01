const Member = require('../models/Member');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const MembershipPlan = require('../models/MembershipPlan');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Progress = require('../models/Progress');
const { calculateExpiryDate, assignMembership: serviceAssignMembership } = require('../services/membershipService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validateMember } = require('../validators/memberValidator');

// @desc    Get all members with filters and pagination
// @route   GET /api/members
// @access  Private (Admin / Trainer)
const getAllMembers = async (req, res, next) => {
  try {
    const { search, status, membershipPlan, trainer, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (membershipPlan) query.membershipPlan = membershipPlan;
    if (trainer) query.trainer = trainer;

    // Search matches against user collection refs
    if (search) {
      const userMatches = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      query.user = { $in: userMatches.map((u) => u._id) };
    }

    const memberQuery = Member.find(query)
      .populate('user', 'name email phone avatar isActive createdAt')
      .populate('membershipPlan', 'name durationMonths price')
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .sort({ createdAt: -1 })
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
      .limit(parseInt(limit, 10));

    const members = await memberQuery;
    const total = await Member.countDocuments(query);

    return successResponse(res, 200, 'Members retrieved', members, {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get member details by ID with populated relations
// @route   GET /api/members/:id
// @access  Private
const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('user', 'name email phone avatar isActive createdAt')
      .populate('membershipPlan')
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'name email phone avatar specialization' },
      });

    if (!member) {
      return errorResponse(res, 404, 'Member not found');
    }

    if (req.user.role === 'member' && member.user?._id?.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Access denied. You can only view your own profile.');
    }

    // Update status dynamically if expired
    member.updateStatusBasedOnExpiry();
    await member.save();

    // Fetch recent attendance, payments (admin only), and progress
    const queries = [
      Attendance.find({ member: member._id }).sort({ date: -1 }).limit(10),
      req.user.role === 'admin'
        ? Payment.find({ member: member._id }).populate('membershipPlan', 'name').sort({ paymentDate: -1 }).limit(10)
        : Promise.resolve([]),
      Progress.find({ member: member._id }).sort({ date: -1 }).limit(10),
    ];

    const [recentAttendance, recentPayments, latestProgress] = await Promise.all(queries);

    return successResponse(res, 200, 'Member details retrieved', {
      member,
      recentAttendance,
      recentPayments,
      latestProgress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new member with user account
// @route   POST /api/members
// @access  Private/Admin
const createMember = async (req, res, next) => {
  try {
    const { isValid, errors } = validateMember(req.body);
    if (!isValid) {
      return errorResponse(res, 400, 'Validation failed', errors);
    }

    const {
      name,
      email,
      phone,
      password = 'member123',
      dob,
      gender = 'male',
      address,
      emergencyContact,
      membershipPlan,
      startDate = new Date(),
      trainer,
      notes,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'User with this email already exists');
    }

    // 1. Create User
    const user = await User.create({
      name,
      email,
      password,
      role: 'member',
      phone: phone || '',
    });

    let member;
    try {
      let expiryDate = null;
      let initialStatus = 'pending';

      // 2. Compute expiry date if membershipPlan is passed
      if (membershipPlan) {
        const plan = await MembershipPlan.findById(membershipPlan);
        if (plan) {
          expiryDate = calculateExpiryDate(startDate, plan.durationMonths);
          initialStatus = 'active';
        }
      }

      // 3. Create Member
      member = await Member.create({
        user: user._id,
        dob: dob || null,
        gender,
        address: address || '',
        emergencyContact: emergencyContact || {},
        membershipPlan: membershipPlan || null,
        startDate: startDate || new Date(),
        expiryDate,
        trainer: trainer || null,
        status: initialStatus,
        notes: notes || '',
      });

      // 4. Update trainer's assigned members list if assigned
      if (trainer) {
        await Trainer.findByIdAndUpdate(trainer, {
          $addToSet: { assignedMembers: member._id },
        });
      }
    } catch (createErr) {
      await User.findByIdAndDelete(user._id).catch(() => {});
      throw createErr;
    }

    const populatedMember = await Member.findById(member._id)
      .populate('user', 'name email phone avatar')
      .populate('membershipPlan')
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'name email phone' },
      });

    return successResponse(res, 201, 'Member created successfully', populatedMember);
  } catch (error) {
    next(error);
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return errorResponse(res, 404, 'Member not found');
    }

    const {
      name,
      email,
      phone,
      dob,
      gender,
      address,
      emergencyContact,
      membershipPlan,
      startDate,
      expiryDate,
      trainer,
      status,
      notes,
    } = req.body;

    // Update underlying User record if name/phone/email provided
    if (member.user) {
      const user = await User.findById(member.user);
      if (user) {
        if (name) user.name = name;
        if (email && email !== user.email) {
          const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
          if (emailExists) return errorResponse(res, 400, 'Email is already in use');
          user.email = email;
        }
        if (phone !== undefined) user.phone = phone;
        await user.save();
      }
    }

    // Handle trainer change
    if (trainer !== undefined && String(trainer) !== String(member.trainer)) {
      if (member.trainer) {
        await Trainer.findByIdAndUpdate(member.trainer, {
          $pull: { assignedMembers: member._id },
        });
      }
      if (trainer) {
        await Trainer.findByIdAndUpdate(trainer, {
          $addToSet: { assignedMembers: member._id },
        });
      }
      member.trainer = trainer || null;
    }

    // Handle membership plan update
    if (membershipPlan && String(membershipPlan) !== String(member.membershipPlan)) {
      const plan = await MembershipPlan.findById(membershipPlan);
      if (plan) {
        member.membershipPlan = plan._id;
        const start = startDate ? new Date(startDate) : new Date();
        member.startDate = start;
        member.expiryDate = calculateExpiryDate(start, plan.durationMonths);
        member.status = 'active';
      }
    } else if (startDate || expiryDate) {
      if (startDate) member.startDate = new Date(startDate);
      if (expiryDate) member.expiryDate = new Date(expiryDate);
    }

    if (dob !== undefined) member.dob = dob;
    if (gender !== undefined) member.gender = gender;
    if (address !== undefined) member.address = address;
    if (emergencyContact !== undefined) member.emergencyContact = emergencyContact;
    if (status !== undefined) member.status = status;
    if (notes !== undefined) member.notes = notes;

    member.updateStatusBasedOnExpiry();
    await member.save();

    const updated = await Member.findById(member._id)
      .populate('user', 'name email phone avatar')
      .populate('membershipPlan')
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'name email phone' },
      });

    return successResponse(res, 200, 'Member updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return errorResponse(res, 404, 'Member not found');
    }

    member.status = member.status === 'inactive' ? 'active' : 'inactive';
    await member.save();

    if (member.user) {
      await User.findByIdAndUpdate(member.user, {
        isActive: member.status === 'active',
      });
    }

    return successResponse(
      res,
      200,
      `Member ${member.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      member
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Assign or renew membership plan
// @route   POST /api/members/:id/assign-membership
// @access  Private/Admin
const assignMembership = async (req, res, next) => {
  try {
    const { membershipPlanId, startDate } = req.body;
    if (!membershipPlanId) {
      return errorResponse(res, 400, 'Membership plan ID is required');
    }

    const member = await serviceAssignMembership(req.params.id, membershipPlanId, startDate);
    const populated = await Member.findById(member._id)
      .populate('user', 'name email phone')
      .populate('membershipPlan');

    return successResponse(res, 200, 'Membership assigned successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get member attendance history
// @route   GET /api/members/:id/attendance
// @access  Private
const getMemberAttendance = async (req, res, next) => {
  try {
    if (req.user.role === 'member') {
      const myMember = await Member.findOne({ user: req.user._id });
      if (!myMember || myMember._id.toString() !== req.params.id) {
        return errorResponse(res, 403, 'Access denied. You can only view your own attendance records.');
      }
    }

    const records = await Attendance.find({ member: req.params.id }).sort({ date: -1 });
    return successResponse(res, 200, 'Attendance records retrieved', records);
  } catch (error) {
    next(error);
  }
};

// @desc    Get member payment history
// @route   GET /api/members/:id/payments
// @access  Private
const getMemberPayments = async (req, res, next) => {
  try {
    if (req.user.role === 'member') {
      const myMember = await Member.findOne({ user: req.user._id });
      if (!myMember || myMember._id.toString() !== req.params.id) {
        return errorResponse(res, 403, 'Access denied. You can only view your own payment records.');
      }
    }

    const payments = await Payment.find({ member: req.params.id })
      .populate('membershipPlan', 'name durationMonths price')
      .sort({ paymentDate: -1 });
    return successResponse(res, 200, 'Payment history retrieved', payments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  assignMembership,
  getMemberAttendance,
  getMemberPayments,
};
