const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { logRequestBody, getUserId } = require('../utils/reqUtils');
const logger = require('../middlewares/logger');
const { loggerService, emailConfigService } = require('../services');

//? Create a email Config
const create = catchAsync(async (req, res) => {
  try {
    const data = await emailConfigService.createEmailConfig(req.body);
    const logString = logger.info(`${getUserId(req)} Created a email config with data ${logRequestBody(req)}`).transports[0]
      .logString;
    await loggerService.createLogger('emailconfigs', getUserId(req), logString);
    res.status(httpStatus.CREATED).send({ success: true, message: 'Successfully created email config.', data });
  } catch (error) {
    const logString = logger.error(
      `${getUserId(req)} Failed to Create email Config, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('emailconfigs', getUserId(req), logString);
    res.status(400).send({ success: false, message: 'Failed created email config.', error });
  }
});

//? update a email Config
const update = catchAsync(async (req, res) => {
  if (Object.keys(req.body).length === 0)
    res.status(400).send({ success: false, message: 'Please provide valid data.', error });
  try {
    const { company_ID } = req.params;
    const data = await emailConfigService.updateEmailConfig(company_ID, req.body);
    const logString = logger.info(`${getUserId(req)} Update a email config with company Id ${company_ID}`).transports[0]
      .logString;
    await loggerService.createLogger('emailconfigs', getUserId(req), logString);
    res.status(httpStatus.CREATED).send({ success: true, message: 'Successfully update email config.', data });
  } catch (error) {
    const logString = logger.error(
      `${getUserId(req)} Failed to Update email Config, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('emailconfigs', getUserId(req), logString);
    res.status(500).send({ success: false, message: 'Failed update email config.', error });
  }
});

//? delete a email Config
const remove = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const data = await emailConfigService.removeByID(id);
    const logString = logger.info(`${getUserId(req)} Delete a email config with Id ${id}`).transports[0].logString;
    await loggerService.createLogger('emailconfigs', getUserId(req), logString);
    res.status(httpStatus.CREATED).send({ success: true, message: 'Successfully deleted email config.', data });
  } catch (error) {
    const logString = logger.info(`${getUserId(req)} Failed to delete email config with Id ${id}`).transports[0].logString;
    await loggerService.createLogger('emailconfigs', getUserId(req), logString);
    res.status(500).json({ success: false, message: 'Failed to delete email config.', error });
  }
});

const getEmailConfig = catchAsync(async (req, res) => {
  try {
    const data = await emailConfigService.getEmailConfigData(req.body);
    const logString = logger.info(`${getUserId(req)} fetch email config with data - ${logRequestBody(req)}`).transports[0]
      .logString;
    await loggerService.createLogger('emailconfigs', getUserId(req), logString);
    res.status(httpStatus.CREATED).send({ success: true, message: 'Fetch email config.', data });
  } catch (error) {
    const logString = logger.info(`${getUserId(req)} failed fetch email config with data - ${logRequestBody(req)}`)
      .transports[0].logString;
    await loggerService.createLogger('emailconfigs', getUserId(req), logString);
    res.status(500).send({ success: false, message: 'Failed fetch email config.', error });
  }
});

module.exports = {
  create,
  update,
  remove,
  getEmailConfig
};
