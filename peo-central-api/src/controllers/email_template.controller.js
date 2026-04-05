const httpStatus = require('http-status');
const { documentTemplateService } = require('../services');
const { emailTemplateService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require('../services');
const { diff } = require('deep-object-diff');
const { activityService } = require('../services');
const ApiError = require('../utils/ApiError');

const getTemplate = catchAsync(async (req, res) => {
  try {
    const document = await documentTemplateService.getDocumentTemplate(req.params);

    res.status(httpStatus.OK).send(document);
  } catch (error) {
    console.log(error);
    const logString = logger.info(`${req.userName} Created a Document`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Failed to create Documents. Please Check the Input', details: error });
  }
});

const addNewTemplate = catchAsync(async (req, res) => {
  try {
    const document = await emailTemplateService.addNewEmailTemplate(req.body, req.userId);
    const logString = logger.info(`${req.userName} Created a new email Template with name ${document.name}`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.OK).send(document);
  } catch (error) {
    const logString = logger.info(`${req.userName} Created a Document`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Failed to create Documents. Please Check the Input', details: error });
  }
});

const addNewEmailTemplate = catchAsync(async (req, res) => {
  try {
    const emailTemplate = await emailTemplateService.addNewEmailTemplate(req.body);
    const createdBy = await emailTemplateService.updateCreatedBy(emailTemplate._id, req.userId);
    const logMessage = logEmailTemplateCreation(req.userId, emailTemplate);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      emailTemplate._id,
      'email_templates',
      {},
      emailTemplate,
      {},
      logMessage
    );
    const logString = logger.info(`${req.userName} Created a Email Template with ID ${emailTemplate._id}`).transports[0]
      .logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(httpStatus.CREATED).send(emailTemplate);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Create Email Template, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Email Template. Please Check the Input', details: error });
  }
});

function logEmailTemplateCreation(userId, emailTemplate) {
  const logMsg = `User ${userId} Created Email Template ${emailTemplate._id}`;
  return logMsg;
}

const updateEmailTemplateOnId = catchAsync(async (req, res) => {
  try {
    const existingEmailTemplatebyID = await emailTemplateService.getEmailTemplatesOnID(req.params.emailTemplateId);
    const updatedEmailTemplate = await emailTemplateService.updateEmailTemplateOnId(
      req.params.emailTemplateId,
      req.body,
      req.userId
    );
    const updatedBy = await emailTemplateService.updateUpdatedBy(req.params.emailTemplateId, req.userId);
    const updatedFields = diff(existingEmailTemplatebyID.toJSON(), updatedEmailTemplate.toJSON());
    const logMessage = logEmailTemplateUpdates(req.userId, existingEmailTemplatebyID, updatedEmailTemplate, updatedFields);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.emailTemplateId,
      'email_templates',
      existingEmailTemplatebyID,
      updatedEmailTemplate,
      updatedFields,
      logMessage
    );
    if (!updatedEmailTemplate) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Email Template');
    }
    const logString = logger.info(
      `${req.userName} Updated a Email Template with Email Template ID ${req.params.emailTemplateId}`
    ).transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(httpStatus.OK).send(updatedEmailTemplate);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Email Template with Email Template ID ${req.params.emailTemplateId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(400).json({ message: 'Failed to Update Email Template. Please Check the Input', details: error });
  }
});

function logEmailTemplateUpdates(userId, oldDoc, updatedEmailTemplate, updatedFields) {
  const logMsg = `User ${userId} updated Email Template ${updatedEmailTemplate._id}\nFields:`;
  const fieldUpdates = [];
  for (const field in updatedFields) {
    fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedEmailTemplate[field]}`);
  }
  return `${logMsg}\n${fieldUpdates.join('\n')}`;
}

const deleteEmailTemplateOnId = catchAsync(async (req, res) => {
  try {
    const existingEmailTemplatebyID = await emailTemplateService.getEmailTemplatesOnID(req.params.emailTemplateId);
    const emailTemplate = await emailTemplateService.deleteEmailTemplateOnId(req.params.emailTemplateId);
    const updatedBy = await emailTemplateService.updateUpdatedBy(req.params.emailTemplateId, req.userId);
    const logMessage = logEmailTemplateDeletion(req.userId, emailTemplate);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.emailTemplateId,
      'email_templates',
      existingEmailTemplatebyID,
      {},
      {},
      logMessage
    );
    if (!emailTemplate) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete Email Template');
    }
    const logString = logger.info(`${req.userName} Deleted Email Template with ID ${req.params.emailTemplateId}`)
      .transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(httpStatus.OK).send(emailTemplate);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Delete Email Template with ID ${req.params.emailTemplateId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(400).json({ message: 'Failed to Delete Email Template for the Given ID', details: error });
  }
});

function logEmailTemplateDeletion(userId, emailTemplate) {
  const logMsg = `User ${userId} Deleted Email Template ${emailTemplate._id}`;
  return logMsg;
}

const getEmailTemplatesOnID = catchAsync(async (req, res) => {
  try {
    const emailTemplate = await emailTemplateService.getEmailTemplatesOnID(req.params.emailTemplateId, req.query.invoice_number);
    if (!emailTemplate) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Email Template');
    }
    const logString = logger.info(`${req.userName} Accessed Email Template with ID ${req.params.emailTemplateId}`)
      .transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(httpStatus.OK).send(emailTemplate);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Email Template with ID ${req.params.emailTemplateId} , encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Email Template for the Given ID', details: error });
  }
});

const listAllEmailTemplates = catchAsync(async (req, res) => {
  try {
    const emailTemplates = await emailTemplateService.listAllEmailTemplates(req.query);
    if (!emailTemplates) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Email Templates');
    }
    const logString = logger.info(`${req.userName} Accessed all the Email Templates`).transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(httpStatus.OK).send(emailTemplates);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access all the Email Templates , encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch All Email Templates', details: error });
  }
});

const getEmailTemplateOnIDWithoutContent = catchAsync(async (req, res) => {
  try {
    const emailTemplates = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
      req.query.templateId,
      req.query.moduleId,
      req.body,
      req.query.onboardingLink,
      req.query.generatedDocumentId,
    );
    // console.log(req.query.onboardingLink, "8888888")
    if (!emailTemplates) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch Email Template');
    }
    const logString = logger.info(`${req.userName} Accessed Email Template with ID - ${req.query.templateId}`).transports[0]
      .logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(httpStatus.OK).send(emailTemplates);
  } catch (error) {
    console.log(error?.message);
    const logString = logger.error(
      `${req.userName} Failed to Access Email Template with ID - ${req.query.templateId} , encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    // res.status(400).json({ message: 'Unable to fetch Email Template', details: error });
    throw new Error(error)
  }
});

const getEmailTemplateByName = catchAsync(async(req, res)=>{
  try {
    const response = await emailTemplateService.getEmailTemplateByName(req.query);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Unable to fetch Email Template by name: ${req.query.templateName}`);
    }
    const logString = logger.info(`${req.userName} Accessed Email Template by name - ${req.query.name}`).transports[0]
      .logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(httpStatus.OK).send(response);
  } catch(error){
    console.log(error)
    const logString = logger.error(
      `${req.userName} Failed to Access Email Template by name - ${req.query.name} , encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('email_templates', req.userId, logString);
    res.status(400).json({ message: 'Unable to fetch Email Template by name', details: error?.message });
  }
})
module.exports = {
  getTemplate,
  addNewTemplate,
  addNewEmailTemplate,
  updateEmailTemplateOnId,
  deleteEmailTemplateOnId,
  getEmailTemplatesOnID,
  listAllEmailTemplates,
  getEmailTemplateOnIDWithoutContent,
  getEmailTemplateByName
};
