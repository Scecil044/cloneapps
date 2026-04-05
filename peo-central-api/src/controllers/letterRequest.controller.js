const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const logger = require('../middlewares/logger');
const pick = require('../utils/pick');
const { letterRequestsService, loggerService } = require('../services');
const { letterController } = require('../controllers');

// Create a new Letter Request
const createLetterRequest = catchAsync(async (req, res) => {
  try {
    console.log("============================>")
    const letterRequest = await letterRequestsService.createLetterRequest(req.body, req.header.host);
    const logString = logger.info(`Created new Letter Request with ID ${letterRequest?.data?._id}`).transports[0].logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: letterRequest?.success, message: letterRequest?.message, data: letterRequest?.data });
  } catch (error) {
    console.log(error)
    const logString = logger.error(`Failed to Create Letter Request, encountered following error => ${error}`).transports[0].logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to create Letter Request. Please Check the Input', error });
  }
});

// Withdraw Letter Request
const withdrawLetterRequest = catchAsync(async (req, res) => {
  try {
    const letterRequest = await letterRequestsService.withdrawLetterRequest(req.body);
    const logString = logger.info(`Letter Request Withdrawn`).transports[0].logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: letterRequest?.success, message: letterRequest?.message, data: letterRequest?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Withdraw Letter Request, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to withdraw Letter Request. Please Check the Input', error });
  }
});

// Reassign Letter Request
const reassignLetterRequest = catchAsync(async (req, res) => {
  try {
    const letterRequest = await letterRequestsService.reassignLetterRequest(req.body);
    const logString = logger.info(`Reassigned Letter Request`).transports[0].logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: letterRequest?.success, message: letterRequest?.message, data: letterRequest?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Reassign Letter Request, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to Reassign Letter Request. Please Check the Input', error });
  }
});

// Approve Letter Request
const approveLetterRequest = catchAsync(async (req, res) => {
  try {
    const letterRequest = await letterRequestsService.approveLetterRequest(req.body);
    if (letterRequest.data.status.toLowerCase() === 'completed') {
      await letterController.letterDownload(
        {
          body: {
            req_id: req.body.letter_id,
            user_id: req.body.user_id,
            bln_newLetter: false,
            letter_keys: []
          }
        },
        res
      );
    }
    const logString = logger.info(`Approved Letter Request`).transports[0].logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: letterRequest?.success, message: letterRequest?.message, data: letterRequest?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Approve Letter Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to Approve Letter Request. Please Check the Input', error });
  }
});

// Reject Letter Request
const rejectLetterRequest = catchAsync(async (req, res) => {
  try {
    const letterRequest = await letterRequestsService.rejectLetterRequest(req.body);
    const logString = logger.info(`Letter Request Rejected`).transports[0].logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: letterRequest?.success, message: letterRequest?.message, data: letterRequest?.data });
  } catch (error) {
    const logString = logger.error(`Failed to Reject Letter Request, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('letter_request', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to Reject Letter Request. Please Check the Input', error });
  }
});

module.exports = {
  createLetterRequest,
  withdrawLetterRequest,
  reassignLetterRequest,
  approveLetterRequest,
  rejectLetterRequest
};
