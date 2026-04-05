const mongoose = require('mongoose');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandlerone = (err, req, res, next) => {
  console.log(err, '#log');
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).json(response);
};

const errorHandler = (err, req, res, next) => {
  console.log(err, '#log');

  // Prevent duplicate responses if headers are already sent
  if (res.headersSent) {
    console.log("response has headers set. exiting operation^^^^^^^^^^^^^^^^")
    return next(err); // Delegate to default error handler
  }

  let { statusCode = httpStatus.INTERNAL_SERVER_ERROR, message = 'An unexpected error occurred' } = err;

  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }), // Include stack trace in development
  };

  // Log the error (more detailed in development)
  logger.error({
    message: err.message,
    stack: config.env === 'development' ? err.stack : undefined,
    statusCode,
  });

  // Send error response
  res.status(statusCode).json(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
