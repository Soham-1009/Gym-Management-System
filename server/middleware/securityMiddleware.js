const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../utils/logger');

/**
 * Configure Helmet HTTP Security Headers
 */
const configureSecurityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'http://localhost:*', 'ws://localhost:*'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' }, // Anti-clickjacking
    noSniff: true, // Prevent MIME-type sniffing
    xssFilter: true, // Legacy browser XSS protection
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
};

/**
 * Global API Rate Limiter
 * Guards against general DDoS, scraping, and endpoint abuse
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn(`[Security Alert] Global rate limit exceeded by IP: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

/**
 * Strict Auth Rate Limiter
 * Specifically defends authentication & password routes against brute-force attacks
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    logger.warn(`[Security Alert] Authentication brute-force limit reached by IP: ${req.ip} on ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please wait 15 minutes before attempting again.',
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

/**
 * NoSQL Injection Protection
 * Removes MongoDB query operators ($gt, $ne, etc.) from request data
 */
const mongoSanitizer = () => {
  return mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      logger.warn(`[Security Alert] Prohibited NoSQL operator detected in key '${key}' from IP: ${req.ip}`);
    },
  });
};

/**
 * XSS & HTML Tag Sanitizer
 * Recursively cleans dangerous script and HTML tags from string inputs
 */
const cleanString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

const deepSanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item));
  }
  const cleanObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      cleanObj[key] = cleanString(value);
    } else if (typeof value === 'object') {
      cleanObj[key] = deepSanitize(value);
    } else {
      cleanObj[key] = value;
    }
  }
  return cleanObj;
};

const xssSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = deepSanitize(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = deepSanitize(req.params);
  }
  next();
};

/**
 * HTTP Parameter Pollution (HPP) Prevention
 * Prevents multiple parameters where only a single scalar parameter is expected
 */
const parameterPollutionGuard = (req, res, next) => {
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (Array.isArray(req.query[key]) && !['status', 'role', 'features'].includes(key)) {
        req.query[key] = req.query[key][0];
      }
    }
  }
  next();
};

/**
 * Security Audit Event Logger
 */
const logSecurityEvent = (eventType, details, req) => {
  const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
  const method = req?.method || 'N/A';
  const url = req?.originalUrl || req?.url || 'N/A';
  const userId = req?.user?._id || req?.user?.id || 'anonymous';
  logger.warn(`[SECURITY AUDIT] Type=${eventType} | IP=${ip} | User=${userId} | Method=${method} | Path=${url} | Details=${JSON.stringify(details)}`);
};

module.exports = {
  configureSecurityHeaders,
  apiRateLimiter,
  authRateLimiter,
  mongoSanitizer,
  xssSanitizer,
  parameterPollutionGuard,
  logSecurityEvent,
};
