const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { dependentsService, loggerService } = require('../services');
const logger = require('../middlewares/logger');


const createNewDependent = catchAsync(async (req, res) => {
  try {
    const response = await dependentsService.createNewDependent(req.body, req.userId);
    const logString = logger.info(`${req.userName} Accessed create new dependentt route`).transports[0]
      .logString;
    await loggerService.createLogger('dependents', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to create new dependent => ${error?.message}`).transports[0]
      .logString;
    await loggerService.createLogger('dependents', req.userId, logString);
    res.status(400).json({ message: 'Failed to create dependents', details: error?.message });
  }
});

const filterDependents = catchAsync(async (req, res) => {
  try {
    const response = await dependentsService.filterDependents(req.query);
    const logString = logger.info(`${req.userName} Accessed get all dependents route`).transports[0]
      .logString;
    await loggerService.createLogger('dependents', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get dependents => ${error?.message}`).transports[0]
      .logString;
    await loggerService.createLogger('dependents', req.userId, logString);
    res.status(400).json({ message: 'Failed to get dependents', details: error?.message });
  }
});
const updateDependent = catchAsync(async (req, res) => {
  try {
    const response = await dependentsService.updateDependent(req.params.depenentId,req.body, req.userId);
    const logString = logger.info(`${req.userName} Accessed update dependent route`).transports[0]
      .logString;
    await loggerService.createLogger('dependents', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to update dependent => ${error?.message}`).transports[0]
      .logString;
    await loggerService.createLogger('dependents', req.userId, logString);
    res.status(400).json({ message: 'Failed to update dependents', details: error?.message });
  }
});
const deleteDependent = catchAsync(async (req, res) => {
  try {
    const response = await dependentsService.deleteDependent(req.params.depenentId,req.body, req.userId);
    const logString = logger.info(`${req.userName} Accessed delete dependent route`).transports[0]
      .logString;
    await loggerService.createLogger('dependents', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to delete dependent => ${error?.message}`).transports[0]
      .logString;
    await loggerService.createLogger('dependents', req.userId, logString);
    res.status(400).json({ message: 'Failed to delete dependents', details: error?.message });
  }
});

module.exports = {
  createNewDependent,
  filterDependents,
  updateDependent,
  deleteDependent
};
