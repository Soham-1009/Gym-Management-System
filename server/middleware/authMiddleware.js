const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/responseHandler');
const { logSecurityEvent } = require('./securityMiddleware');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logSecurityEvent('UNAUTHENTICATED_ACCESS_ATTEMPT', { reason: 'No token provided' }, req);
    return errorResponse(res, 401, 'Access denied. No authentication token provided.');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    logSecurityEvent('INVALID_TOKEN_ATTEMPT', { reason: 'Signature verification failure or expired' }, req);
    return errorResponse(res, 401, 'Invalid or expired token. Please log in again.');
  }

  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logSecurityEvent('ORPHANED_TOKEN_ATTEMPT', { userId: decoded.id }, req);
      return errorResponse(res, 401, 'User associated with this token no longer exists.');
    }
    if (!user.isActive) {
      logSecurityEvent('DEACTIVATED_ACCOUNT_LOGIN_ATTEMPT', { userId: user._id, email: user.email }, req);
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact administration.');
    }

    if ((decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      logSecurityEvent('EXPIRED_PASSWORD_TOKEN_ATTEMPT', { userId: user._id }, req);
      return errorResponse(res, 401, 'Password was updated. Please log in again.');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 500, 'Authentication error: ' + error.message);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logSecurityEvent(
        'UNAUTHORIZED_ROLE_ACCESS',
        {
          requiredRoles: roles,
          userRole: req.user ? req.user.role : 'anonymous',
          userId: req.user ? req.user._id : null,
        },
        req
      );
      return errorResponse(
        res,
        403,
        `Access forbidden: Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
