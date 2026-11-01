const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all exercises catalog
// @route   GET /api/workouts/exercises
// @access  Private
const getAllExercises = async (req, res, next) => {
  try {
    const { category, targetMuscle } = req.query;
    let query = {};
    if (category) query.category = category;
    if (targetMuscle) query.targetMuscle = { $regex: targetMuscle, $options: 'i' };

    const exercises = await Exercise.find(query).sort({ name: 1 });
    return successResponse(res, 200, 'Exercises retrieved', exercises);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new exercise in catalog
// @route   POST /api/workouts/exercises
// @access  Private (Admin / Trainer)
const createExercise = async (req, res, next) => {
  try {
    const { name, category, targetMuscle, equipment, description, instructions } = req.body;
    if (!name) return errorResponse(res, 400, 'Exercise name is required');

    const exercise = await Exercise.create({
      name,
      category,
      targetMuscle,
      equipment,
      description,
      instructions: Array.isArray(instructions) ? instructions : (instructions ? instructions.split('\n') : []),
    });

    return successResponse(res, 201, 'Exercise created', exercise);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workout plans
// @route   GET /api/workouts
// @access  Private
const getAllWorkoutPlans = async (req, res, next) => {
  try {
    const { memberId, trainerId, level } = req.query;
    let query = {};

    if (req.user.role === 'member') {
      const myMember = await Member.findOne({ user: req.user._id });
      if (!myMember) return successResponse(res, 200, 'Workout plans retrieved', []);
      query.member = myMember._id;
    } else {
      if (memberId) query.member = memberId;
      if (trainerId) query.trainer = trainerId;
    }
    if (level) query.level = level;

    const plans = await WorkoutPlan.find(query)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'name email specialization' },
      })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Workout plans retrieved', plans);
  } catch (error) {
    next(error);
  }
};

// @desc    Get workout plan by ID
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutPlanById = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email' },
      })
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'name email specialization' },
      });

    if (!plan) return errorResponse(res, 404, 'Workout plan not found');

    if (req.user.role === 'member') {
      const myMember = await Member.findOne({ user: req.user._id });
      const ownerId = plan.member && (plan.member._id || plan.member).toString();
      if (!myMember || ownerId !== myMember._id.toString()) {
        return errorResponse(res, 403, 'Access denied. You can only view your own workout plans.');
      }
    }

    return successResponse(res, 200, 'Workout plan details', plan);
  } catch (error) {
    next(error);
  }
};

// @desc    Create workout plan for member
// @route   POST /api/workouts
// @access  Private (Trainer / Admin)
const createWorkoutPlan = async (req, res, next) => {
  try {
    const { name, member: memberId, goal, level, exercises, startDate, endDate, notes } = req.body;

    if (!name || !memberId) {
      return errorResponse(res, 400, 'Plan name and member ID are required');
    }

    let trainerId = null;
    if (req.user.role === 'trainer') {
      const tr = await Trainer.findOne({ user: req.user._id });
      if (tr) trainerId = tr._id;
    } else if (req.body.trainer) {
      trainerId = req.body.trainer;
    }

    const plan = await WorkoutPlan.create({
      name,
      member: memberId,
      trainer: trainerId,
      goal: goal || 'General Fitness',
      level: level || 'beginner',
      exercises: exercises || [],
      startDate: startDate || new Date(),
      endDate: endDate || null,
      notes: notes || '',
    });

    const populated = await WorkoutPlan.findById(plan._id)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email' },
      })
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'name' },
      });

    return successResponse(res, 201, 'Workout plan created successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout plan
// @route   PUT /api/workouts/:id
// @access  Private (Trainer / Admin)
const updateWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return errorResponse(res, 404, 'Workout plan not found');

    if (req.user.role === 'trainer') {
      const tr = await Trainer.findOne({ user: req.user._id });
      if (!tr || !plan.trainer || plan.trainer.toString() !== tr._id.toString()) {
        return errorResponse(res, 403, 'You are only authorized to edit workout plans assigned by you');
      }
    }

    const { name, goal, level, exercises, startDate, endDate, notes, isActive } = req.body;

    if (name) plan.name = name;
    if (goal) plan.goal = goal;
    if (level) plan.level = level;
    if (exercises) plan.exercises = exercises;
    if (startDate) plan.startDate = startDate;
    if (endDate !== undefined) plan.endDate = endDate;
    if (notes !== undefined) plan.notes = notes;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();
    return successResponse(res, 200, 'Workout plan updated', plan);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout plan
// @route   DELETE /api/workouts/:id
// @access  Private (Trainer / Admin)
const deleteWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return errorResponse(res, 404, 'Workout plan not found');

    if (req.user.role === 'trainer') {
      const tr = await Trainer.findOne({ user: req.user._id });
      if (!tr || !plan.trainer || plan.trainer.toString() !== tr._id.toString()) {
        return errorResponse(res, 403, 'You are only authorized to delete workout plans assigned by you');
      }
    }

    await WorkoutPlan.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'Workout plan deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current member's active workout plan
// @route   GET /api/workouts/my
// @access  Private (Member)
const getMyWorkoutPlan = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) return errorResponse(res, 404, 'Member record not found');

    const plans = await WorkoutPlan.find({ member: member._id, isActive: true })
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'name email phone avatar specialization' },
      })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Member workout plans retrieved', plans);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExercises,
  createExercise,
  getAllWorkoutPlans,
  getWorkoutPlanById,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  getMyWorkoutPlan,
};
