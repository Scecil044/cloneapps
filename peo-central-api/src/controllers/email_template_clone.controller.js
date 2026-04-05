const { emailTemplateCloneService } = require('../services');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const logger = require('../middlewares/logger');
const { loggerService } = require('../services');

const listAllEmailTemplateClone = catchAsync(async (req, res) => {
  try {
    const result = await emailTemplateCloneService.listAllEmailTemplateClone();
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.status(400).json({ message: 'Failed to Fetch Email Template Clone', details: error });
  }
});

const getEmailTemplateCloneById = catchAsync(async (req, res) => {
  try {
    const result = await emailTemplateCloneService.getEmailTemplateCloneById(req.params.cloneID);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.status(400).json({ message: 'Failed to Fetch Email Template Clone for the given ID ', details: error });
  }
});

const updateEmailTemplateCloneOnId = catchAsync(async (req, res) => {
  try {
    const result = await emailTemplateCloneService.updateEmailTemplateCloneOnId(req.params.cloneID, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.status(400).json({ message: 'Failed to Update Email Template Clone for the given ID ', details: error });
  }
});

const createEmailTemplateClone = catchAsync(async (req, res) => {
  try {
    const result = await emailTemplateCloneService.createEmailTemplateClone(req.body);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.status(400).json({ message: 'Failed to Create Email Template Clone', details: error });
  }
});

const deleteEmailTemplateClone = catchAsync(async (req, res) => {
  try {
    const result = await emailTemplateCloneService.deleteEmailTemplateClone(req.params.cloneID);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.status(400).json({ message: 'Failed to Delete Email Template Clone', details: error });
  }
});

const getEmailTemplateOnIDWithoutContent = catchAsync(async (req, res) => {
  try {
    const result = await emailTemplateCloneService.getEmailTemplateOnIDWithoutContent(req.params.EmailTempltCloneID);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get Email Template.', details: error });
  }
});

const getEmailTemplate = catchAsync(async (req, res) => {
  try {
    const result = await emailTemplateCloneService.getEmailTemplate(req.params.EmailTempltCloneID, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get Email Template.', details: error });
  }
});

module.exports = {
  listAllEmailTemplateClone,
  getEmailTemplateCloneById,
  updateEmailTemplateCloneOnId,
  createEmailTemplateClone,
  deleteEmailTemplateClone,
  getEmailTemplateOnIDWithoutContent,
  getEmailTemplate,
};
