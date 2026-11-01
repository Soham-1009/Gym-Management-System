const User = require('../models/User');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const { generateToken, verifyToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { logSecurityEvent } = require('../middleware/securityMiddleware');

const ALLOWED_ROLES = ['member', 'trainer', 'admin'];

/**
 * Public sign-ups may only create members. Elevated roles (trainer/admin) require the caller to
 * be an authenticated admin. The single exception is first-run bootstrap: if no admin exists yet,
 * the first admin account may be created so a fresh install can be set up.
 */
const canAssignRole = async (req, role) => {
  if (role === 'member') return true;

  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    const decoded = verifyToken(header.split(' ')[1]);
    if (decoded) {
      const caller = await User.findById(decoded.id).select('role isActive');
      if (caller && caller.isActive && caller.role === 'admin') return true;
    }
  }

  if (role === 'admin') {
    const adminExists = await User.exists({ role: 'admin' });
    if (!adminExists) return true;
  }
  return false;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegister(req.body);
    if (!isValid) {
      return errorResponse(res, 400, 'Validation failed', errors);
    }

    const { name, email, password, role = 'member', phone, avatar } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      return errorResponse(res, 400, 'Invalid role specified');
    }
    if (!(await canAssignRole(req, role))) {
      logSecurityEvent('REGISTER_ROLE_ESCALATION_BLOCKED', { email, requestedRole: role }, req);
      return errorResponse(res, 403, 'Only administrators can create trainer or admin accounts');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists with this email address');
    }

    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        avatar,
      });

      // Create corresponding Member or Trainer record if applicable
      if (role === 'member') {
        await Member.create({
          user: user._id,
          joinDate: new Date(),
          status: 'active',
        });
      } else if (role === 'trainer') {
        await Trainer.create({
          user: user._id,
          specialization: req.body.specialization || 'General Fitness',
          experienceYears: req.body.experienceYears || 1,
          phone: phone || '',
        });
      }
    } catch (createErr) {
      if (user && user._id) {
        await User.findByIdAndDelete(user._id).catch(() => {});
      }
      throw createErr;
    }

    const token = generateToken({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 });

    return successResponse(res, 201, 'User registered successfully', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLogin(req.body);
    if (!isValid) {
      return errorResponse(res, 400, 'Validation failed', errors);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logSecurityEvent('FAILED_LOGIN_UNKNOWN_EMAIL', { email }, req);
      return errorResponse(res, 401, 'Invalid credentials');
    }

    if (!user.isActive) {
      logSecurityEvent('LOGIN_DEACTIVATED_ACCOUNT', { email, userId: user._id }, req);
      return errorResponse(res, 403, 'Account is deactivated. Please contact administrator.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logSecurityEvent('FAILED_LOGIN_PASSWORD_MISMATCH', { email, userId: user._id }, req);
      return errorResponse(res, 401, 'Invalid credentials');
    }

    logSecurityEvent('SUCCESSFUL_USER_LOGIN', { userId: user._id, role: user.role }, req);

    let extraData = {};
    if (user.role === 'member') {
      const member = await Member.findOne({ user: user._id })
        .populate('membershipPlan')
        .populate({
          path: 'trainer',
          populate: { path: 'user', select: 'name email phone avatar' },
        });
      if (member) extraData.memberId = member._id;
    } else if (user.role === 'trainer') {
      const trainer = await Trainer.findOne({ user: user._id });
      if (trainer) extraData.trainerId = trainer._id;
    }

    const token = generateToken({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 });

    return successResponse(res, 200, 'Logged in successfully', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        ...extraData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profileData = { user };

    if (user.role === 'member') {
      const member = await Member.findOne({ user: user._id })
        .populate('membershipPlan')
        .populate({
          path: 'trainer',
          populate: { path: 'user', select: 'name email phone avatar' },
        });
      profileData.member = member;
    } else if (user.role === 'trainer') {
      const trainer = await Trainer.findOne({ user: user._id }).populate({
        path: 'assignedMembers',
        populate: { path: 'user', select: 'name email phone' },
      });
      profileData.trainer = trainer;
    }

    return successResponse(res, 200, 'Profile retrieved', profileData);
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    if (user.role === 'trainer' && req.body.specialization) {
      await Trainer.findOneAndUpdate(
        { user: user._id },
        {
          specialization: req.body.specialization,
          bio: req.body.bio || '',
          availability: req.body.availability || 'full-time',
        }
      );
    }

    if (user.role === 'member' && (req.body.address || req.body.emergencyContact)) {
      const updateFields = {};
      if (req.body.address !== undefined) updateFields.address = req.body.address;
      if (req.body.emergencyContact) updateFields.emergencyContact = req.body.emergencyContact;
      await Member.findOneAndUpdate({ user: user._id }, updateFields);
    }

    return successResponse(res, 200, 'Profile updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Current and new password are required');
    }
    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      logSecurityEvent('PASSWORD_CHANGE_CURRENT_PASSWORD_MISMATCH', { userId: req.user._id }, req);
      // 400 (not 401): the session is valid, only the supplied password is wrong.
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    logSecurityEvent('PASSWORD_CHANGED_SUCCESSFULLY', { userId: user._id }, req);

    const token = generateToken({ id: user._id, role: user.role, tokenVersion: user.tokenVersion });
    return successResponse(res, 200, 'Password updated successfully', { token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
};
