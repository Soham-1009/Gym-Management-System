const { errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  return errorResponse(res, 404, `Resource not found - ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
  logger.error(`Error in [${req.method}] ${req.originalUrl}:`, err.message);

  let statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Payload Too Large / Entity Too Large
  if (err.type === 'entity.too.large' || err.status === 413) {
    statusCode = 413;
    message = 'Request payload exceeds maximum allowed size limit (100kb)';
  }

  // Mongoose CastError (bad ObjectId, invalid number, invalid date, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'field'} format: ${err.value}`;
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field}. Please use another value.`;
    errors = err.keyValue;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => val.message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  return errorResponse(res, statusCode, message, errors);
};

module.exports = {
  notFound,
  errorHandler,
};
