const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all users with search, role filter, pagination
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, isActive, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const users = await User.find(query).skip(skip).limit(parseInt(limit, 10)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);

    return successResponse(res, 200, 'Users fetched successfully', users, {
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');
    return successResponse(res, 200, 'User fetched', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, isActive, avatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    return successResponse(res, 200, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle deactivate user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id.toString()) {
      return errorResponse(res, 400, 'You cannot deactivate your own account.');
    }

    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.isActive = !user.isActive;
    await user.save();

    return successResponse(
      res,
      200,
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
