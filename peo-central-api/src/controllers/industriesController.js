const { industriesService, loggerService, activityService } = require('../services');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { diff } = require('deep-object-diff');
const logger = require('../middlewares/logger');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

/**
 * Create a new industry
 */
const createIndustry = catchAsync(async (req, res) => {
  try {
    const industry = await industriesService.createIndustry(req.body);

    // Log the activity
    const logMessage = `${req.userName} created Industry with name ${industry.industry_name}`;
    const logString = logger.info(logMessage).transports[0].logString;
    await loggerService.createLogger('Industry', req.userId, logString);
    res.status(httpStatus.CREATED).json(industry);
  } catch (error) {
    const logString = logger.error(`${req.userName} Unable to create Industry, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('Industry', req.userId, logString);
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
});

/**
 * Get industry by ID
 */
const getIndustryById = catchAsync(async (req, res) => {
  try {
    const industry = await industriesService.getIndustryById(req.params.industryId);
    const logString = logger.info(`${req.userName} fetched Industry with id ${req.params.industryId}`).transports[0]
      .logString;
    await loggerService.createLogger('Industry', req.userId, logString);

    res.status(httpStatus.OK).json(industry);
  } catch (error) {
    const logString = logger.error(`${req.userName} Unable to fetch Industry, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('Industry', req.userId, logString);
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
});

/**
 * Update industry by ID
 */
const updateIndustry = catchAsync(async (req, res) => {
  try {
    // Get the original industry for comparison
    const originalIndustry = await industriesService.getIndustryById(req.params.industryId);

    // Update the industry
    const updatedIndustry = await industriesService.updateIndustryById(req.params.industryId, req.body);

    // Get the differences for logging
    const changes = diff(originalIndustry.toObject(), updatedIndustry.toObject());

    // Log the activity
    const logMessage = `${req.userName} updated Industry with id ${req.params.industryId}`;
    const logString = logger.info(logMessage).transports[0].logString;
    await loggerService.createLogger('Industry', req.userId, logString);

    // Create activity log
    await activityService.createActivity(
      req.userId,
      updatedIndustry._id,
      'industry',
      originalIndustry,
      updatedIndustry,
      changes,
      logMessage
    );

    res.status(httpStatus.OK).json(updatedIndustry);
  } catch (error) {
    const logString = logger.error(`${req.userName} Unable to update Industry, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('Industry', req.userId, logString);
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
});

/**
 * Delete industry by ID
 */
const deleteIndustry = catchAsync(async (req, res) => {
  try {
    // Get the original industry for logging
    const originalIndustry = await industriesService.getIndustryById(req.params.industryId);

    // Soft delete the industry
    const deletedIndustry = await industriesService.deleteIndustryById(req.params.industryId, req.userId);

    // Log the activity
    const logMessage = `${req.userName} deleted Industry with id ${req.params.industryId}`;
    const logString = logger.info(logMessage).transports[0].logString;
    await loggerService.createLogger('Industry', req.userId, logString);

    // Create activity log
    await activityService.createActivity(
      req.userId,
      deletedIndustry._id,
      'industry',
      originalIndustry,
      deletedIndustry,
      { is_deleted: true, deleted_by: req.userId },
      logMessage
    );

    res.status(httpStatus.OK).json(deletedIndustry);
  } catch (error) {
    const logString = logger.error(`${req.userName} Unable to delete Industry, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('Industry', req.userId, logString);
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
});

/**
 * Get all industries with pagination and filtering
 */
const getAllIndustries = catchAsync(async (req, res) => {
  try {
    const result = await industriesService.queryIndustries(req.query);
    const logString = logger.info(`${req.userName} fetched all Industries`).transports[0].logString;
    await loggerService.createLogger('Industry', req.userId, logString);

    res.status(httpStatus.OK).json(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Unable to fetch Industries, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('Industry', req.userId, logString);
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
});

module.exports = {
  createIndustry,
  getIndustryById,
  updateIndustry,
  deleteIndustry,
  getAllIndustries
};
