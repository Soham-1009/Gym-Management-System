const mongoose = require('mongoose');
const { MONGO_URI, USE_IN_MEMORY_DB } = require('./env');
const logger = require('../utils/logger');

let memoryServer = null;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    if (USE_IN_MEMORY_DB === 'true') {
      logger.info('USE_IN_MEMORY_DB is set to true. Initializing in-memory MongoDB server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      logger.success(`MongoDB connected to In-Memory instance: ${uri}`);
      return;
    }

    // Try connecting to configured MONGO_URI with a short serverSelectionTimeoutMS
    logger.info(`Attempting MongoDB connection to: ${MONGO_URI}`);
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
      });
      logger.success(`MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
    } catch (connErr) {
      if (USE_IN_MEMORY_DB === 'auto') {
        logger.warn(`Could not connect to external MongoDB at ${MONGO_URI} (${connErr.message}). Falling back to MongoMemoryServer for instant zero-config operation...`);
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        logger.success(`MongoDB successfully started and connected to In-Memory fallback: ${memUri}`);
      } else {
        throw connErr;
      }
    }
  } catch (error) {
    logger.error('Fatal: Failed to connect to any MongoDB instance:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    logger.info('MongoDB disconnected.');
  } catch (error) {
    logger.error('Error disconnecting MongoDB:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
