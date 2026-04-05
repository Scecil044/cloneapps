const crypto = require('crypto');
const { ApiKey } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const generateXAPIKey = async (reqBody, userId) => {
  try {
    const apiKey = crypto.randomBytes(32).toString('hex');
    reqBody = { ...reqBody, key: apiKey, createdBy: userId };
    const newApiKey = await ApiKey.create(reqBody);
    return newApiKey;
  } catch (error) {
    throw error;
  }
};

const verifyXAPIKey = async (apiKey) => {
  try {
    if (!apiKey) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'API key is required');
    }
    const keyDoc = await ApiKey.findOne({
      key: apiKey,
      isActive: true,
      is_deleted: false,
    });

    if (!keyDoc) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or inactive API key');
    }

    return keyDoc;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateXAPIKey,
  verifyXAPIKey
};
