const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const apiKeyService = require('../services/apikey.service');
const logger = require('./logger');

// function apiKeyService() {
//   return require('../services/apikey.service');
// }

/**
 * Middleware to verify API key from X-API-Key header
 * This middleware can be used to protect routes that should be accessible
 * only with a valid API key, without requiring user authentication
 */
const verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      logger.error('API key missing in request headers');
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: 'API key is required in X-API-Key header'
      });
    }

    // Verify the API key using the existing service
    const keyDoc = await apiKeyService.verifyXAPIKey(apiKey);

    // Add API key info to request for use in controllers
    req.apiKey = {
      id: keyDoc._id,
      appName: keyDoc.appName
    };

    logger.info(`Request authenticated with API key for app: ${keyDoc.appName}`);
    next();
  } catch (error) {
    logger.error(`API key verification failed: ${error.message}`);
    return res.status(error.statusCode || httpStatus.UNAUTHORIZED).json({
      message: 'Invalid or inactive API key',
      details: error.message
    });
  }
};

module.exports = verifyApiKey;
