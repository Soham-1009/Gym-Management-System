const app = require('./app');
const { connectDB } = require('./config/db');
const { PORT } = require('./config/env');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed initial demo dataset if database has zero users
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Database has no users. Automatically populating initial seed records...');
      const seedDatabase = require('./seed/seedData');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      logger.success(`====================================================`);
      logger.success(`  Gym Management System Backend Server is Running!`);
      logger.success(`  Port: http://localhost:${PORT}`);
      logger.success(`  API Health: http://localhost:${PORT}/api/health`);
      logger.success(`====================================================`);

      // Run membership expiration sync on startup and every 24 hours
      const { syncAllMembersStatus } = require('./services/membershipService');
      syncAllMembersStatus().catch((err) => logger.error('Startup expiry sync failed:', err.message));
      setInterval(() => syncAllMembersStatus().catch(() => {}), 24 * 60 * 60 * 1000);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection:', err.message);
    });

    // Handle SIGINT/SIGTERM for graceful shutdown
    const handleShutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  } catch (error) {
    logger.error('Fatal server boot failure:', error.message);
    process.exit(1);
  }
};

startServer();
