const Trainer = require('../models/Trainer');
const User = require('../models/User');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
const getAllTrainers = async (req, res, next) => {
  try {
    const { search, specialization, status } = req.query;
    let query = {};

    if (status) query.status = status;
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };

    if (search) {
      const userMatches = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      query.$or = [
        { user: { $in: userMatches.map((u) => u._id) } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const trainers = await Trainer.find(query)
      .populate('user', 'name email phone avatar isActive createdAt')
      .populate({
        path: 'assignedMembers',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Trainers retrieved', trainers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get trainer by ID
// @route   GET /api/trainers/:id
// @access  Private
const getTrainerById = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('user', 'name email phone avatar isActive createdAt')
      .populate({
        path: 'assignedMembers',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'membershipPlan', select: 'name' },
        ],
      });

    if (!trainer) {
      return errorResponse(res, 404, 'Trainer not found');
    }

    return successResponse(res, 200, 'Trainer details retrieved', trainer);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new trainer
// @route   POST /api/trainers
// @access  Private/Admin
const createTrainer = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password = 'trainer123',
      specialization,
      experienceYears = 1,
      bio = '',
      availability = 'full-time',
    } = req.body;

    if (!name || !email || !specialization) {
      return errorResponse(res, 400, 'Name, email, and specialization are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'User with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'trainer',
      phone: phone || '',
    });

    let trainer;
    try {
      trainer = await Trainer.create({
        user: user._id,
        specialization,
        experienceYears: parseInt(experienceYears, 10),
        bio,
        phone: phone || '',
        availability,
      });
    } catch (createErr) {
      await User.findByIdAndDelete(user._id).catch(() => {});
      throw createErr;
    }

    const populated = await Trainer.findById(trainer._id).populate('user', 'name email phone avatar');

    return successResponse(res, 201, 'Trainer created successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Private (Admin / Trainer)
const updateTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return errorResponse(res, 404, 'Trainer not found');
    }

    if (req.user.role === 'trainer' && trainer.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'You are only authorized to update your own coach profile');
    }

    const { name, email, phone, specialization, experienceYears, bio, availability, status } = req.body;

    if (trainer.user) {
      const user = await User.findById(trainer.user);
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

    if (specialization) trainer.specialization = specialization;
    if (experienceYears !== undefined) trainer.experienceYears = parseInt(experienceYears, 10);
    if (bio !== undefined) trainer.bio = bio;
    if (availability) trainer.availability = availability;
    if (status && req.user.role === 'admin') trainer.status = status;
    if (phone !== undefined) trainer.phone = phone;

    await trainer.save();

    const populated = await Trainer.findById(trainer._id).populate('user', 'name email phone avatar');
    return successResponse(res, 200, 'Trainer updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate trainer
// @route   DELETE /api/trainers/:id
// @access  Private/Admin
const deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return errorResponse(res, 404, 'Trainer not found');
    }

    trainer.status = trainer.status === 'inactive' ? 'active' : 'inactive';
    await trainer.save();

    if (trainer.user) {
      await User.findByIdAndUpdate(trainer.user, {
        isActive: trainer.status === 'active',
      });
    }

    return successResponse(
      res,
      200,
      `Trainer ${trainer.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      trainer
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get assigned members for a trainer
// @route   GET /api/trainers/:id/members
// @access  Private
const getAssignedMembers = async (req, res, next) => {
  try {
    const trainerId = req.params.id;
    const members = await Member.find({ trainer: trainerId })
      .populate('user', 'name email phone avatar')
      .populate('membershipPlan', 'name');

    return successResponse(res, 200, 'Assigned members retrieved', members);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getAssignedMembers,
};
