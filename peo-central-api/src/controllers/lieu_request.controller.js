const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/loggers');
const { loggerService, lieuRequestService } = require('../services');

// Create a new Lieu Request
const createLieuRequest = catchAsync(async (req, res) => {
  try {
    const lieuRequest = await lieuRequestService.createLieuRequest(req.body, req.headers.host);
    const logString = logger.info(`Created new Lieu Request with ID ${lieuRequest._id}`).transports[0].logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res.status(200).json({ success: lieuRequest?.success, message: lieuRequest?.message, data: lieuRequest?.data });
  } catch (error) {
    console.log(error, 'error');
    const logString = logger.error(`Failed to Create Lieu Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res
      .status(200)
      .json({ success: false, message: error.message || 'Failed to create Lieu Request. Please Check the Input', error });
  }
});

// Withdraw Lieu Request
const withdrawLieuRequest = catchAsync(async (req, res) => {
  try {
    const lieuRequest = await lieuRequestService.withdrawLieuRequest(req.body);
    const logString = logger.info(`Lieu Request Withdrawn`).transports[0].logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res.status(200).json({ success: lieuRequest?.success, message: lieuRequest?.message, data: lieuRequest?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Withdraw Lieu Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to withdraw Lieu Request. Please Check the Input', error });
  }
});

// Approve Lieu Request
const approveLieuRequest = catchAsync(async (req, res) => {
  try {
    const lieuRequest = await lieuRequestService.approveLieuRequest(req.body, req.headers.host);
    const logString = logger.info(`Lieu Request Approved`).transports[0].logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res.status(200).json({ success: lieuRequest?.success, message: lieuRequest?.message, data: lieuRequest?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Approve Lieu Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to approve Lieu Request. Please Check the Input', error });
  }
});

// Reject a Lieu Request
const rejectLieuRequest = catchAsync(async (req, res) => {
  try {
    const lieuRequest = await lieuRequestService.rejectLieuRequest(req.body, req.headers.host);
    const logString = logger.info(`Lieu Request Rejected`).transports[0].logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res.status(200).json({ success: lieuRequest?.success, message: lieuRequest?.message, data: lieuRequest?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Reject Lieu Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to reject Lieu Request. Please Check the Input', error });
  }
});

// Reassign a Lieu Request
const reassignLieuRequest = catchAsync(async (req, res) => {
  try {
    const lieuRequest = await lieuRequestService.reassignLieuRequest(req.body, req.headers.host);
    const logString = logger.info(`Reassigned Lieu Request`).transports[0].logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res.status(200).json({ success: lieuRequest?.success, message: lieuRequest?.message, data: lieuRequest?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Reassign Lieu Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('lieu_request', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to Reassign Lieu Request. Please Check the Input', error });
  }
});

module.exports = {
  createLieuRequest,
  withdrawLieuRequest,
  approveLieuRequest,
  rejectLieuRequest,
  reassignLieuRequest
};
