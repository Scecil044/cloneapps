const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { documentsFolderService } = require('../services');
const logger = require('../middlewares/logger');
const { loggerService, } = require('../services');
const ApiError = require('../utils/ApiError');

const createDocumentsFolder = catchAsync(async (req, res) => {
  try {
    const response = await documentsFolderService.createDocumentsFolder(req.body, req.userId);
    const logString = logger.info(`${req.userName} Accessed all the API to create a new document folder`).transports[0]
      .logString;
    await loggerService.createLogger('Document Folders', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Create new document folder => ${error?.message}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw new Error('Ooops! Sometthing went wrong. Could not create document folder' || error?.message);
  }
});
const findFolderById = catchAsync(async (req, res) => {
  try {
    const response = await documentsFolderService.findFolderById(req.params.folderId);
    const logString = logger.info(`${req.userName} Accessed folder with id ${req.params.folderId}`).transports[0]
      .logString;
    await loggerService.createLogger('Document Folders', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed access document folder with id ${req.params.folderId} => ${error?.message}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw new Error(`Ooops! Sometthing went wrong. Could not access folder with id ${req.params.folderId} ` || error?.message);
  }
});

const markFileAsDeleted = catchAsync(async (req, res) => {
  try {
    const response = await documentsFolderService.markFileAsDeleted(req.params.folderId, req.params.documentId, req.userId);
    const logString = logger.info(`${req.userName} Accessed route tto delete folder with id ${req.params.folderId}`).transports[0]
      .logString;
    await loggerService.createLogger('Document Folders', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed delete document folder with id ${req.params.folderId} => ${error?.message}`)
      .transports[0].logString;
    await loggerService.createLogger('users', req.userId, logString);
    throw new Error(`Ooops! Sometthing went wrong. Could not delete folder with id ${req.params.folderId} ` || error?.message);
  }
});

const getDocumentsFolders = catchAsync(async (req, res) => {
    try {
        const response = await documentsFolderService.getDocumentsFolders(req.query);
        const logString = logger.info(`${req.userName} Accessed all Documents folder api`).transports[0]
          .logString;
        await loggerService.createLogger('Document Folders', req.userId, logString);
        res.status(httpStatus.OK).json(response);
      } catch (error) {
        const logString = logger.error(`${req.userName} Failed to Access document folders => ${error?.message}`)
          .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error('Ooops! Sometthing went wrong. Could not fetch document folders' || error?.message);
      }
});

const updateDocumentsFolder = catchAsync(async (req, res) => {
    try {
        const response = await documentsFolderService.updateDocumentsFolder(req.params.folderId, req.body, req.userId);
        const logString = logger.info(`${req.userName} Accessed update document folder`).transports[0]
          .logString;
        await loggerService.createLogger('Document Folders', req.userId, logString);
        res.status(httpStatus.OK).json(response);
      } catch (error) {
        const logString = logger.error(`${req.userName} Failed to update document folder with id ${req.paramas.folderId} => ${error?.message}`)
          .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error('Ooops! Sometthing went wrong. Could not update document folder' || error?.message);
      }
});

const deleteDocumentsFolder = catchAsync(async (req, res) => {
    try {
        const response = await documentsFolderService.deleteDocumentsFolder(req.params.folderId, req.userId);
        const logString = logger.info(`${req.userName} Accessed delete document folder api`).transports[0]
          .logString;
        await loggerService.createLogger('Document Folders', req.userId, logString);
        res.status(httpStatus.OK).json(response);
      } catch (error) {
        const logString = logger.error(`${req.userName} Failed to delete document folder with id ${req.paramas.folderId} => ${error?.message}`)
          .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error( error?.message || 'Ooops! Sometthing went wrong. Could not delete document folder' );
      }
});

const addFileToFolder = catchAsync(async (req, res) => {
    try {
        // Extract the file URL from the request body
        const { fileUrl } = req.body;
        
        if (!fileUrl) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'File URL is required'
            });
        }

        // Use the existing updateDocumentsFolder function but with a modified request
        const response = await documentsFolderService.updateDocumentsFolder(
            req.params.folderId, 
            { files: [fileUrl] },
            req.userId
        );
        
        const logString = logger.info(`${req.userName} Added a file to document folder ${req.params.folderId}`).transports[0].logString;
        await loggerService.createLogger('Document Folders', req.userId, logString);
        
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} Failed to add file to document folder with id ${req.params.folderId} => ${error?.message}`)
            .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error('Could not add file to document folder: ' + (error?.message || 'Unknown error'));
    }
});

const fetchFolderDocuments = catchAsync(async(req, res)=>{
    try {
        const response = await documentsFolderService.fetchFolderDocuments(req.params.folderId, req.userId);
        const logString = logger.info(`${req.userName} Accessed fetch folder documents  api`).transports[0]
          .logString;
        await loggerService.createLogger('Document Folders', req.userId, logString);
        res.status(httpStatus.OK).json(response);
      } catch (error) {
        const logString = logger.error(`${req.userName} Failed to fetch documents from document folder with id ${req.paramas.folderId} => ${error?.message}`)
          .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error('Ooops! Sometthing went wrong. Could not fetch folder documents' || error?.message);
      }
})

module.exports = {
  createDocumentsFolder,
  findFolderById,
  getDocumentsFolders,
  updateDocumentsFolder,
  deleteDocumentsFolder,
  fetchFolderDocuments,
  markFileAsDeleted,
  addFileToFolder
};
