const httpStatus = require("http-status");
const { documentTemplateService } = require("../services")
const { smsTemplateService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")


const getTemplate = catchAsync(async (req, res) => {
    try {
        const document = await documentTemplateService.getDocumentTemplate(req.params);

        res.status(httpStatus.OK).send(document);
    } catch (error) {
        console.log(error)
        const logString = (logger.info(`${req.userName} Created a Document`)).transports[0].logString;
        await loggerService.createLogger('documents', req.userId, logString);
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create Documents. Please Check the Input', details: error });
    }
});


const addNewTemplate = catchAsync(async (req, res) => {
    try {
        const document = await smsTemplateService.addNewSMSTemplate(req.body);

        res.status(httpStatus.OK).send(document);
    } catch (error) {
        console.log(error)
        const logString = (logger.info(`${req.userName} Created a Document`)).transports[0].logString;
        await loggerService.createLogger('documents', req.userId, logString);
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create Documents. Please Check the Input', details: error });
    }
});


const addNewSMSTemplate = catchAsync(async (req, res) => {
    try {
        const smsTemplate = await smsTemplateService.addNewSMSTemplate(req.body)
        const createdBy = await smsTemplateService.updateCreatedBy(smsTemplate._id, req.userId);
        const logMessage = logSMSTemplateCreation(req.userId, smsTemplate);
        const addActivityLog = await activityService.createActivity(req.userId, smsTemplate._id, "sms_templates", {}, smsTemplate, {}, logMessage);
        const logString = (logger.info(`${req.userName} Created a SMS Template with ID ${smsTemplate._id}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(httpStatus.CREATED).send(smsTemplate);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create SMS Template, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to create SMS Template. Please Check the Input', details: error });
    }
});

function logSMSTemplateCreation(userId, smsTemplate) {
    const logMsg = `User ${userId} Created SMS Template ${smsTemplate._id}`;
    return logMsg
}

const updateSMSTemplateOnId = catchAsync(async (req, res) => {
    try {
        const existingSMSTemplatebyID = await smsTemplateService.getSMSTemplatesOnID(req.params.smsTemplateId);
        const updatedSMSTemplate = await smsTemplateService.updateSMSTemplateOnId(req.params.smsTemplateId, req.body, req.userId);
        const updatedBy = await smsTemplateService.updateUpdatedBy(req.params.smsTemplateId, req.userId);
        const updatedFields = diff(existingSMSTemplatebyID.toJSON(), updatedSMSTemplate.toJSON());
        const logMessage = logSMSTemplateUpdates(req.userId, existingSMSTemplatebyID, updatedSMSTemplate, updatedFields);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.smsTemplateId, "sms_templates", existingSMSTemplatebyID, updatedSMSTemplate, updatedFields, logMessage);
        if (!updatedSMSTemplate) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update SMS Template');
        }
        const logString = (logger.info(`${req.userName} Updated a SMS Template with SMS Template ID ${req.params.smsTemplateId}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(httpStatus.OK).send(updatedSMSTemplate)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update SMS Template with SMS Template ID ${req.params.smsTemplateId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update SMS Template. Please Check the Input', details: error });
    }
});

function logSMSTemplateUpdates(userId, oldDoc, updatedSMSTemplate, updatedFields) {
    const logMsg = `User ${userId} updated SMS Template ${updatedSMSTemplate._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedSMSTemplate[field]}`);
    }
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const deleteSMSTemplateOnId = catchAsync(async (req, res) => {
    try {
        const existingSMSTemplatebyID = await smsTemplateService.getSMSTemplatesOnID(req.params.smsTemplateId);
        const smsTemplate = await smsTemplateService.deleteSMSTemplateOnId(req.params.smsTemplateId)
        const updatedBy = await smsTemplateService.updateUpdatedBy(req.params.smsTemplateId, req.userId);
        const logMessage = logSMSTemplateDeletion(req.userId, smsTemplate);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.smsTemplateId, "sms_templates", existingSMSTemplatebyID, {}, {}, logMessage);
        if (!smsTemplate) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete SMS Template');
        }
        const logString = (logger.info(`${req.userName} Deleted SMS Template with ID ${req.params.smsTemplateId}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(httpStatus.OK).send(smsTemplate);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete SMS Template with ID ${req.params.smsTemplateId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete SMS Template for the Given ID', details: error });
    }
})

function logSMSTemplateDeletion(userId, smsTemplate) {
    const logMsg = `User ${userId} Deleted SMS Template ${smsTemplate._id}`;
    return logMsg
}

const getSMSTemplatesOnID = catchAsync(async (req, res) => {
    try {
        const smsTemplate = await smsTemplateService.getSMSTemplatesOnID(req.params.smsTemplateId)
        if (!smsTemplate) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch SMS Template');
        }
        const logString = (logger.info(`${req.userName} Accessed SMS Template with ID ${req.params.smsTemplateId}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(httpStatus.OK).send(smsTemplate)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access SMS Template with ID ${req.params.smsTemplateId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch SMS Template for the Given ID', details: error });
    }
})

const listAllSMSTemplates = catchAsync(async (req, res) => {
    try {
        const smsTemplates = await smsTemplateService.listAllSMSTemplates()
        if (!smsTemplates) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all SMS Templates');
        }
        const logString = (logger.info(`${req.userName} Accessed all the SMS Templates`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(httpStatus.OK).send(smsTemplates)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access all the SMS Templates , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch All SMS Templates', details: error });
    }
});

const getSMSTemplateOnIDWithoutContent = catchAsync(async (req, res) => {
    try {
        const smsTemplates = await smsTemplateService.getSMSTemplateOnIDWithoutContent(req.query.templateId, req.query.moduleId)
        if (!smsTemplates) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch SMS Template');
        }
        const logString = (logger.info(`${req.userName} Accessed SMS Template with ID - ${req.query.templateId}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(httpStatus.OK).send(smsTemplates)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access SMS Template with ID - ${req.query.templateId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(400).json({ message: 'Unable to fetch SMS Template', details: error });
    }
});



const sendSms = catchAsync(async (req, res) => {
    try {
        const smsTemplates = await smsTemplateService.smsSend(req.body)
        if (!smsTemplates) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Send SMS');
        }
        const logString = (logger.info(`${req.userName} Send SMS SuccessFully - ${req.query.templateId}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(httpStatus.OK).send(smsTemplates)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access SMS Template with ID - ${req.query.templateId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('sms_templates', req.userId, logString);
        res.status(400).json({ message: 'Unable to fetch SMS Template', details: error });
    }
});

module.exports = {
    getTemplate,
    addNewTemplate,
    addNewSMSTemplate,
    updateSMSTemplateOnId,
    deleteSMSTemplateOnId,
    getSMSTemplatesOnID,
    listAllSMSTemplates,
    getSMSTemplateOnIDWithoutContent, 
    sendSms
}