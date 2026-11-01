const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const {
  configureSecurityHeaders,
  apiRateLimiter,
  mongoSanitizer,
  xssSanitizer,
  parameterPollutionGuard,
} = require('./middleware/securityMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const memberRoutes = require('./routes/memberRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const progressRoutes = require('./routes/progressRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Disable X-Powered-By header to conceal underlying Express framework
app.disable('x-powered-by');

// 1. HTTP Security Headers via Helmet
app.use(configureSecurityHeaders());

// 2. Cross-Origin Resource Sharing (CORS) Hardening
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Unlisted origins get no CORS headers, so browsers block the response.
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// 3. Request Payload Size Guard to mitigate payload flooding DoS
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 4. NoSQL Query Injection Defense
app.use(mongoSanitizer());

// 5. Cross-Site Scripting (XSS) Input Sanitization
app.use(xssSanitizer);

// 6. HTTP Parameter Pollution (HPP) Prevention
app.use(parameterPollutionGuard);

// 7. General API Rate Limiting
app.use('/api', apiRateLimiter);

// Request Logging (development/production)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Gym Management System API',
    security: 'Hardened (Helmet, RateLimiting, MongoSanitize, XSS, HPP)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
