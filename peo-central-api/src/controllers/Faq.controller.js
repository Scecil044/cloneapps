const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { loggerService, faqService } = require('../services');
const logger = require('../middlewares/logger');

/**
 * Function to create FAQ.
 * Calls the service: createFaq
 */
const createFaq = catchAsync(async (req, res) => {
  try {
    const requiredFields = ['question', 'answer', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    // Check for missing fields
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Please provide the required fields: ${missingFields.join(', ')}` });
    }
    const response = await faqService.createFaq(req.body, req.userId);
    const logString = logger.info(`${req.userName} Accessed create FAQ route`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    console.log(error);
    const logString = logger.error(`${req.userName} Failed to create new Faq, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to create new fAQ' });
  }
});

/**
 * Function to get FAQ by id.
 * Calls the service: getFaqById
 */
const getFaqById = catchAsync(async (req, res) => {
  try {
    const response = await faqService.getFaqById(req.params.faqId);
    const logString = logger.info(`${req.userName} Accessed  FAQ by id route`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get Faq by id, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to get fAQ by id' });
  }
});

/**
 * Function to update FAQ by provided FAQ id.
 * Calls the service: updateFaqById
 */
const updateFaqById = catchAsync(async (req, res) => {
  try {
    const response = await faqService.updateFaqById(req.params.faqId, req.body, req.userId);
    const logString = logger.info(`${req.userName} Accessed  update FAQ by id route`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    console.log(error);
    const logString = logger.error(`${req.userName} Failed to update faq by id, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to update fAQ by id' });
  }
});

/**
 * Function to delete FAQ by provided FAQ id.
 * Calls the service: deleteFaq
 */
const deleteFaqById = catchAsync(async (req, res) => {
  try {
    const response = await faqService.deleteFaq(req.params.faqId, req.userId);
    const logString = logger.info(`${req.userName} Accessed  delete FAQ by id route`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.log(error);
    const logString = logger.error(`${req.userName} Failed to delete faq by id, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res
      .status(400)
      .json({ message: `Failed to delete fAq. An error was encountered with the following details: ${error.message}` });
  }
});

/**
 * Function to filter FAQs.
 * Calls the service: filterFaqs
 */
const filterFaqs = catchAsync(async (req, res) => {
  try {
    const response = await faqService.filterFaqs(req.query);
    const logString = logger.info(`${req.userName} Accessed  filter FAQ route`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to filter faqs, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to filter fAQ by id' });
  }
});

const filterFaqsByCategory = catchAsync(async (req, res) => {
  try {
    const response = await faqService.filterFaqsByCategory(req.query);
    const logString = logger.info(`${req.userName} Accessed  filter FAQ route`).transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to filter faqs, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    res.status(400).json({ message: 'Failed to filter fAQ by id' });
  }
});

module.exports = {
  createFaq,
  getFaqById,
  updateFaqById,
  deleteFaqById,
  filterFaqs,
  filterFaqsByCategory,
};
