const catchAsync = require('../utils/catchAsync');
const { inquiryService, loggerService } = require('../services');
const httpStatus = require('http-status');
const logger = require('../middlewares/logger');

const createInquiry = catchAsync(async (req, res) => {
  try {
    const result = await inquiryService.createInquiry(req.body);
    const logString = logger.info(`${req.userName} created Inquiry with id ${result._id}`).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    res.status(httpStatus.CREATED).json({ message: 'success', result });
  } catch (error) {
    const logString = logger.error(`${req.userName} Unable to create Inquiry, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    throw new Error(`Unable to create Inquiry, encountered following error => ${error?.message}`);
  }
});

const getInquiryCounts = catchAsync(async (req, res) => {
  try {
    const result = await inquiryService.getInquiryCounts();
    const logString = logger.info(`${req.userName} fetched Inquiry counts`).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    // res.status(httpStatus.OK).json({ message: 'success', result });
    res.status(httpStatus.OK).json({ message: 'success', data: result });
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Unable to get Inquiries counts, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    throw new Error(`Unable to  Inquiries counts, encountered following error => ${error?.message}`);
  }
});

const filterInquiries = catchAsync(async (req, res) => {
  try {
    const result = await inquiryService.filterInquiries(req.body, req.query);
    const logString = logger.info(`${req.userName} fetched Inquiries`).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    // res.status(httpStatus.OK).json({ message: 'success', result });
    res.status(httpStatus.OK).json({ message: 'success', data: result });
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Unable to filter Inquiries, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    throw new Error(`Unable to filter Inquiries, encountered following error => ${error?.message}`);
  }
});

const assignInquiryToPro = catchAsync(async (req, res) => {
  try {
    const result = await inquiryService.assignToPRO(req.body, req);
    const logString = logger.info(
      `${req.userName} assigned Inquiry with id ${req.body.inquiryId} to Pro with id ${req.body.proId}`
    ).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    res.status(httpStatus.OK).json({ message: 'success', result });
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Unable to assign Inquiry to Pro, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    throw error;
  }
});

const archiveInquiry = catchAsync(async (req, res) => {
  try {
    const { inquiryId, reason } = req.body;
    await inquiryService.deleteEnquiry(inquiryId, req.userId, reason);
    const logString = logger.info(`${req.userName} archived Inquiry with id ${req.body.inquiryId}`).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    res.status(httpStatus.OK).json({ message: 'success' });
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Unable to archive Inquiry encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    throw error;
  }
});


const restoreArchivedInquiry = catchAsync(async (req, res) => {
  try {
    const { inquiryId, reason } = req.body;
    await inquiryService.restoreArchivedInquiry(inquiryId, req.userId, reason);
    const logString = logger.info(`${req.userName} restored archived Inquiry with id ${req.body.inquiryId}`).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    res.status(httpStatus.OK).json({ message: 'success' });
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Unable to restore archived Inquiry encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    throw error;
  }
});

const reassignToPRO = catchAsync(async (req, res) => {
  try {
    const result = await inquiryService.reassignToPRO(req.body, req);
    const logString = logger.info(
      `${req.userName} re-assigned Inquiry with id ${req.body.inquiryID} to Pro with id ${req.body.reassignTo}`
    ).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    res.status(httpStatus.OK).json({ message: 'success', result });
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Unable to re-assign Inquiry to Pro, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('Inquiry', req.userId, logString);
    throw error;
  }
})
module.exports = {
  createInquiry,
  filterInquiries,
  assignInquiryToPro,
  archiveInquiry,
  getInquiryCounts,
  reassignToPRO,
  restoreArchivedInquiry,
};
