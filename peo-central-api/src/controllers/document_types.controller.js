const httpStatus = require('http-status');
const { documentTypesService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require('../services');

const createDocumentType = catchAsync(async (req, res) => {
  try {
    const document = await documentTypesService.createDocumentType(req.body);
    const created_by = await documentTypesService.updateCreatedBy(document._id, req.userId);
    const logString = logger.info(`${req.userName} Created a Document Type with ID ${document._id}`).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(httpStatus.CREATED).send(document);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Create a Document Type, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Document Type. Please Check the Input', details: error });
  }
});

const updateDocumentTypeOnId = catchAsync(async (req, res) => {
  try {
    const document = await documentTypesService.updateDocumentTypeOnId(req.params.documentId, req.body);
    const updatedBy = await documentTypesService.updateUpdatedBy(req.params.documentId, req.userId);
    if (!document) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Document Type');
    }
    const logString = logger.info(`${req.userName} Updated a Document with DocumentTypeID - ${req.params.documentId}`)
      .transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(httpStatus.OK).send(document);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update a Document Type with DocumentTypeID - ${req.params.documentId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(400).json({ message: 'Failed to Update Document Type. Please Check the Input', details: error });
  }
});

const listAllDocumentTypes = catchAsync(async (req, res) => {
  try {
    const documents = await documentTypesService.listAllDocumentTypes(req.query);
    if (!documents) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Document Types');
    }
    const logString = logger.info(`${req.userName} Accessed all the Document Types`).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(httpStatus.OK).send(documents);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Document Type, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch All Document Types.', details: error });
  }
});

const documentTypeById = catchAsync(async (req, res) => {
  try {
    const documents = await documentTypesService.documentTypeById(req.params.documentId);
    if (!documents) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the Document Types');
    }
    const logString = logger.info(
      `${req.userName} Accessed all the Document Types with DocumentTypeID - ${req.params.documentId}`
    ).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(httpStatus.OK).send(documents);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access the Document Type with DocumentTypeID - ${req.params.documentId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Document Types for the Given ID.', details: error });
  }
});

const deleteDocumentType = catchAsync(async (req, res) => {
  try {
    const documents = await documentTypesService.deleteDocumentType(req.params.documentId);
    const updatedBy = await documentTypesService.updateUpdatedBy(req.params.documentId, req.userId);
    if (!documents) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete Document Types');
    }
    const logString = logger.info(`${req.userName} Deleted Document Types with DocumentTypeId - ${req.params.documentId}`)
      .transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(httpStatus.OK).send(documents);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Delete the Document Type with DocumentTypeId - ${req.params.documentId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(400).json({ message: 'Failed to Delete Document Types for the Given ID.', details: error });
  }
});

const getDocumentTypeOnTheType = catchAsync(async (req, res) => {
  try {
    const documents = await documentTypesService.getDocumentTypeOnTheType(req.params.type);
    if (!documents) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the Document Type');
    }
    const logString = logger.info(`${req.userName} Accessed all the Document Types with Type - ${req.params.type}`)
      .transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(httpStatus.OK).send(documents);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access the Document Type with Type - ${req.params.type}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Document Types for the Given Type.', details: error });
  }
});

const getDocumentList = catchAsync(async (req, res) => {
  try {
    const documents = await documentTypesService.getDocumentList(req.body.list);
    if (!documents) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the Document Type');
    }
    const logString = logger.info(`${req.userName} Accessed all the Document Types with Type - ${req.body.list}`)
      .transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(httpStatus.OK).send(documents);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access the Document Type with Type - ${req.body.list}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documenttypes', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Document Types for the Given Type.', details: error });
  }
});

module.exports = {
  createDocumentType,
  updateDocumentTypeOnId,
  listAllDocumentTypes,
  documentTypeById,
  deleteDocumentType,
  getDocumentTypeOnTheType,
  getDocumentList,
};
