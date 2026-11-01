const MembershipPlan = require('../models/MembershipPlan');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all membership plans
// @route   GET /api/memberships
// @access  Public
const getAllPlans = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const plans = await MembershipPlan.find(query).sort({ price: 1 });
    return successResponse(res, 200, 'Membership plans retrieved', plans);
  } catch (error) {
    next(error);
  }
};

// @desc    Get membership plan by ID
// @route   GET /api/memberships/:id
// @access  Public
const getPlanById = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return errorResponse(res, 404, 'Membership plan not found');
    return successResponse(res, 200, 'Membership plan retrieved', plan);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new membership plan
// @route   POST /api/memberships
// @access  Private/Admin
const createPlan = async (req, res, next) => {
  try {
    const { name, durationMonths, price, description, features } = req.body;
    if (!name || !durationMonths || price === undefined) {
      return errorResponse(res, 400, 'Name, duration in months, and price are required');
    }

    const existing = await MembershipPlan.findOne({ name });
    if (existing) {
      return errorResponse(res, 400, 'Plan with this name already exists');
    }

    const plan = await MembershipPlan.create({
      name,
      durationMonths: parseInt(durationMonths, 10),
      price: parseFloat(price),
      description: description || '',
      features: Array.isArray(features) ? features : (features ? features.split(',').map((f) => f.trim()) : []),
    });

    return successResponse(res, 201, 'Membership plan created', plan);
  } catch (error) {
    next(error);
  }
};

// @desc    Update membership plan
// @route   PUT /api/memberships/:id
// @access  Private/Admin
const updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return errorResponse(res, 404, 'Membership plan not found');

    const { name, durationMonths, price, description, features, status } = req.body;

    if (name) plan.name = name;
    if (durationMonths !== undefined) plan.durationMonths = parseInt(durationMonths, 10);
    if (price !== undefined) plan.price = parseFloat(price);
    if (description !== undefined) plan.description = description;
    if (features !== undefined) {
      plan.features = Array.isArray(features) ? features : features.split(',').map((f) => f.trim());
    }
    if (status) plan.status = status;

    await plan.save();
    return successResponse(res, 200, 'Membership plan updated', plan);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle membership plan status
// @route   DELETE /api/memberships/:id
// @access  Private/Admin
const deletePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return errorResponse(res, 404, 'Membership plan not found');

    plan.status = plan.status === 'inactive' ? 'active' : 'inactive';
    await plan.save();

    return successResponse(res, 200, `Plan ${plan.status === 'active' ? 'activated' : 'deactivated'}`, plan);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
