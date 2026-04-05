const httpStatus = require("http-status");
const { documentTemplateService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")

const getDocTemplatesOnID = catchAsync(async (req, res) => {
    try {
        const result = await documentTemplateService.getDocTemplatesOnID(req.params.templateId);
        const logString = (logger.info(`${req.userName} Accessed Document Template with ID - ${req.params.templateId}`)).transports[0].logString;
        await loggerService.createLogger('document_templates', req.userId, logString);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get Document Template with ID - ${req.params.templateId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('document_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to Get Document Template for the given ID ', details: error });
    }
})


const addNewTemplate = catchAsync(async (req, res) => {
    try {
        const documentTemplate = await documentTemplateService.addNewDocumentTemplate(req.body)
        const createdBy = await documentTemplateService.updateCreatedBy(documentTemplate._id, req.userId);
        const logMessage = logDocumentTemplateCreation(req.userId, documentTemplate);
        const addActivityLog = await activityService.createActivity(req.userId, documentTemplate._id, "document_templates", {}, documentTemplate, {}, logMessage);
        const logString = (logger.info(`${req.userName} Created a Document Template with ID ${documentTemplate._id}`)).transports[0].logString;
        await loggerService.createLogger('document_templates', req.userId, logString);
        res.status(httpStatus.CREATED).send(documentTemplate);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create Document Template, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('document_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to create Document Template. Please Check the Input', details: error });
    }
});

function logDocumentTemplateCreation(userId, documentTemplate) {
    const logMsg = `User ${userId} Created Document Template ${documentTemplate._id}`;
    return logMsg
}

const listAllDocumentTemplates = catchAsync(async (req, res) => {
    try {
        const documents = await documentTemplateService.listAllDocumentTemplates()
        if (!documents) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch all Document Templates');
        }
        const logString = (logger.info(`${req.userName} Accessed All Document Templates`)).transports[0].logString;
        await loggerService.createLogger('document_templates', req.userId, logString);
        res.send(documents)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access All Document Templates, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('document_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch All Document Templates', details: error });
    }
});

const updateDocumentTemplateOnId = catchAsync(async (req, res) => {
    try {
        // const existingDocumentById = await documentTemplateService.getDocTemplatesOnID(req.params.templateId)
        const updatedDocument = await documentTemplateService.updateDocumentTemplateOnId(req.params.templateId, req.body)
        // const updatedBy = await documentTemplateService.updateUpdatedBy(req.params.templateId, req.userId);
        // const updatedFields = diff(existingDocumentById.toJSON(), updatedDocument.toJSON());
        // const logMessage = logDocumentUpdates(req.userId, existingDocumentById, updatedDocument, updatedFields);
        // const addActivityLog = await activityService.createActivity(req.userId, req.params.templateId, "document_templates", existingDocumentById, updatedDocument, updatedFields, logMessage);
        // if (!updatedDocument) {
        //     throw new ApiError(httpStatus.NOT_FOUND, 'Cannot update Document');
        // }
        // const logString = (logger.info(`${req.userName} Updated a Document with TemplateID - ${req.params.templateId}`)).transports[0].logString;
        // await loggerService.createLogger('document_templates', req.userId, logString);
        res.send(updatedDocument)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update a Document with TemplateID - ${req.params.templateId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('document_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Document Template. Please Check the Input', details: error });
    }
});

function logDocumentUpdates(userId, oldDoc, updatedDocument, updatedFields) {
    const logMsg = `User ${userId} updated Document Template ${updatedDocument._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedDocument[field]}`);
    }
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const deleteDocumentTemplate = catchAsync(async (req, res) => {
    try {
        const existingDocumentById = await documentTemplateService.getDocTemplatesOnID(req.params.templateId)
        const updatedDocument = await documentTemplateService.deleteDocumentTemplate(req.params.templateId)
        const updatedBy = await documentTemplateService.updateUpdatedBy(req.params.templateId, req.userId);
        const logMessage = logDocumentDeletion(req.userId, updatedDocument);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.templateId, "document_templates", existingDocumentById, {}, {}, logMessage);
        if (!updatedDocument) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete Document');
        }
        const logString = (logger.info(`${req.userName} Deleted Doc Template with Template ID - ${req.params.templateId}`)).transports[0].logString;
        await loggerService.createLogger('document_templates', req.userId, logString);
        res.status(httpStatus.OK).send(updatedDocument);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete Doc Template with Template ID - ${req.params.templateId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('document_templates', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete the Documnet for the Provided ID ', details: error });
    }
});

function logDocumentDeletion(userId, updatedDocument) {
    const logMsg = `User ${userId} Deleted Document Template ${updatedDocument._id}`;
    return logMsg
}

module.exports = {
    addNewTemplate,
    getDocTemplatesOnID,
    listAllDocumentTemplates,
    updateDocumentTemplateOnId,
    deleteDocumentTemplate
}