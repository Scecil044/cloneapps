const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentReversalService } = require('../services');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const loggerService = require('../services/loggers.service');

/**
 * Reverse a payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const reversePayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { reason } = req.body;
  const { userId, userName } = req;

  if (!reason || reason.trim().length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reversal reason is required');
  }

  if (reason.trim().length < 10) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reversal reason must be at least 10 characters long');
  }

  try {
    const result = await paymentReversalService.reversePayment(
      paymentId,
      userId,
      userName,
      reason.trim()
    );

    const logString = logger.info(`${userName} successfully reversed payment ${paymentId}`).transports[0].logString;
    await loggerService.createLogger('payment_reversal', userId, logString);

    res.status(httpStatus.OK).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    const logString = logger.error(`${userName} failed to reverse payment ${paymentId} => ${error.message}`)
      .transports[0].logString;
    await loggerService.createLogger('payment_reversal', userId, logString);
    throw error;
  }
});

/**
 * Get payment reversal history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentReversalHistory = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { userId, userName } = req;

  try {
    const history = await paymentReversalService.getPaymentReversalHistory(paymentId);

    if (!history) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No reversal history found for this payment');
    }

    const logString = logger.info(`${userName} accessed payment reversal history for ${paymentId}`).transports[0].logString;
    await loggerService.createLogger('payment_reversal', userId, logString);

    res.status(httpStatus.OK).json({
      success: true,
      data: history
    });
  } catch (error) {
    const logString = logger.error(`${userName} failed to get payment reversal history for ${paymentId} => ${error.message}`)
      .transports[0].logString;
    await loggerService.createLogger('payment_reversal', userId, logString);
    throw error;
  }
});

module.exports = {
  reversePayment,
  getPaymentReversalHistory
};
