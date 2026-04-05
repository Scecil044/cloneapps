const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { loggerService,  } = require('../services');
const apiKeyService = require("../services/apikey.service");
const { diff } = require('deep-object-diff');
const logger = require('../middlewares/logger');
const ApiError = require('../utils/ApiError');

const generateApiKey = catchAsync(async (req, res, next) => {
  try {
    const response = await apiKeyService.generateXAPIKey(req.body, req.userId);
    const logString = logger.info(`${req.userName} Created a XApiKey with ID ${response._id}`).transports[0].logString;
    await loggerService.createLogger('ApiKeys', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to generate XApiKey=> ${error?.message}`).transports[0].logString;
    await loggerService.createLogger('ApiKeys', req.userId, logString);
    res.status(400).json({ message: 'Failed to generate XApiKey', details: error?.message });
  }
});


const verifyApiKey = catchAsync(async (req, res, next) => {
  try {
    const { key } = req.body;
    const keyDoc = await apiKeyService.verifyXAPIKey(key);
    const response = {
      _id: keyDoc._id,
      appName: keyDoc.appName,
      isActive: keyDoc.isActive,
      createdBy: keyDoc.createdBy,
      createdAt: keyDoc.createdAt,
      updatedAt: keyDoc.updatedAt,
    };
    const logString = logger.info(`${req.userName} Verified XApiKey for app ${keyDoc.appName} (ID: ${keyDoc._id})`).transports[0].logString;
    await loggerService.createLogger('ApiKeys', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to verify XApiKey: ${error?.message}`).transports[0].logString;
    await loggerService.createLogger('ApiKeys', req.userId, logString);
    res.status(error.statusCode || httpStatus.BAD_REQUEST).json({ message: 'Failed to verify XApiKey', details: error?.message });
  }
});

module.exports = {
  generateApiKey,
  verifyApiKey
};
