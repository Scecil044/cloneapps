const httpStatus = require('http-status');
const { documentsService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require('../services');
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require('../services');
const { Documents } = require('../models');
const cron = require('node-cron');

const createDocument = catchAsync(async (req, res) => {
  try {
    const document = await documentsService.createDocument(req.body, req.files, req.userId);
    const logString = logger.info(`${req.userName} Created a Document`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.CREATED).send(document);
  } catch (error) {
    const logString = logger.info(`${req.userName} Created a Document`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Documents. Please Check the Input', details: error?.message });
  }
});

const createRecord = catchAsync(async (req, res) => {
  try {
    const document = await documentsService.createRecord(req.body, req.userId);
    const logString = logger.info(`${req.userName} Created a Document`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.CREATED).send(document);
  } catch (error) {
    const logString = logger.info(`${req.userName} Created a Document`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Documents. Please Check the Input', details: error });
  }
});

const updateDocumentOnId = catchAsync(async (req, res) => {
  try {
    const existingDocumentById = await documentsService.documentById(req.params.documentId);
    const updatedDocument = await documentsService.updateDocumentOnId(req.params.documentId, req.body);
    const updatedBy = await documentsService.updateUpdatedBy(req.params.documentId, req.userId);
    const updatedFields = diff(existingDocumentById.toJSON(), updatedDocument.toJSON());
    const logMessage = logDocumentUpdates(req.userId, existingDocumentById, updatedDocument, updatedFields);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.documentId,
      'documents',
      existingDocumentById,
      updatedDocument,
      updatedFields,
      logMessage
    );
    if (!updatedDocument) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot update Document');
    }
    const logString = logger.info(`${req.userName} Updated a Document with DocumentID - ${req.params.documentId}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.send(updatedDocument);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update a Document with DocumentID - ${req.params.documentId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Update Documents. Please Check the Input', details: error });
  }
});

function logDocumentUpdates(userId, oldDoc, updatedDocument, updatedFields) {
  const logMsg = `User ${userId} updated Document ${updatedDocument._id}\nFields:`;
  const fieldUpdates = [];
  for (const field in updatedFields) {
    fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedDocument[field]}`);
  }
  return `${logMsg}\n${fieldUpdates.join('\n')}`;
}

const listAllDocuments = catchAsync(async (req, res) => {
  try {
    const documents = await documentsService.listAllDocuments(req.query);
    if (!documents) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch all Documents');
    }
    const logString = logger.info(`${req.userName} Accessed All Documents`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.send(documents);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Access All Documents, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch All Documents', details: error });
  }
});

const uploadDocumentsOnDocIdAndForeignId = catchAsync(async (req, res) => {
  try {
    const existingDocumentById = await documentsService.documentById(req.body.document_id);
    const document = await documentsService.uploadDocumentsOnDocIdAndForeignId(
      req.body.document_id,
      req.body.foreign_id,
      req.files,
      req.body,
      req.userId
    );
    const updatedDocument = await documentsService.documentById(req.body.document_id);
    const updatedFields = diff(existingDocumentById.toJSON(), updatedDocument.toJSON());
    const logMessage = logDocumentUploads(req.userId, existingDocumentById, updatedDocument, updatedFields);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.body.document_id,
      'documents',
      existingDocumentById,
      updatedDocument,
      updatedFields,
      logMessage
    );
    const logString = logger.info(
      `${req.userName} Uploaded Document with Document Name - ${document.name} and DocumentID - ${req.body.document_id} and ForeignID - ${req.body.foreign_id}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.CREATED).send(document);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Upload Document for the following DocumentID - ${req.body.document_id} and ForeignID - ${req.body.foreign_id}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Upload the Document. Please verify the Document', details: error });
  }
});

function logDocumentUploads(userId, oldDoc, updatedDocument, updatedFields) {
  const logMsg = `User ${userId} Uploaded Document ${updatedDocument.url} for the Document with ID ${updatedDocument._id}`;
  return `${logMsg}`;
}

const simpleDocumentUpload = catchAsync(async (req, res) => {
  try {
    const document = await documentsService.simpleDocumentUpload(req.userId || req.body.companyId, req.files, req.body);
    res.status(httpStatus.CREATED).send(document);
    const logString = logger.info(`${req.userName} Uploaded a Documnet`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
  } catch (error) {
    console.log(error)
    const logString = logger.error(`${req.userName} Failed to Upload Document, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Upload the Document. Please verify the Document ', details: error?.message });
  }
});

// Onboarding-specific document upload for onboarding links
const onboardingDocumentUpload = catchAsync(async (req, res) => {
  try {
    // For onboarding tokens, req.userId is the company ID
    const document = await documentsService.simpleDocumentUpload(req.userId, req.files, req.body);
    res.status(httpStatus.CREATED).send(document);
    const logString = logger.info(`${req.userName} (Onboarding) Uploaded a Document`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
  } catch (error) {
    console.log(error)
    const logString = logger.error(`${req.userName} (Onboarding) Failed to Upload Document, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Upload the Document. Please verify the Document ', details: error?.message });
  }
});

// function returns mime times and file names
const simpleDocumentUploadWithMimeTypes = catchAsync(async (req, res) => {
  try {
    const document = await documentsService.simpleDocumentUploadWithMimeTypes(req.userId, req.files);
    res.status(httpStatus.CREATED).send(document);
    const logString = logger.info(`${req.userName} Uploaded a Documnet`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Upload Document, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Upload the Document. Please verify the Document ', details: error });
  }
});

const simpleDocumentUploadBase64 = catchAsync(async (req, res) => {
  try {
    const document = await documentsService.simpleDocumentUploadBase64(
      req.body.base64,
      req.body.name,
      req.body.mimetype,
      req.userId
    );
    res.status(httpStatus.CREATED).send(document);
    const logString = logger.info(`${req.userName} Uploaded a Documnet`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Upload Document, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Upload the Document. Please verify the Document ', details: error });
  }
});

const documentById = catchAsync(async (req, res) => {
  try {
    const documents = await documentsService.documentById(req.params.documentId);
    if (!documents) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot fetch the Document');
    }
    const logString = logger.info(`${req.userName} Accessed Documents with DocumentID - ${req.params.documentId}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.send(documents);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Documents with DocumentID - ${req.params.documentId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch the Document for the given ID ', details: error });
  }
});

const deleteDocument = catchAsync(async (req, res) => {
  try {
    const existingDocumentById = await documentsService.documentById(req.params.documentId);

    // Prepare deletion data from request body
    const deletionData = {
      reason_for_deletion: req.body.reason || '',
      deleted_by: req.body.deleted_by || req.userId
    };

    const updatedDocument = await documentsService.deleteDocument(req.params.documentId, deletionData);
    const updatedBy = await documentsService.updateUpdatedBy(req.params.documentId, req.userId);
    const logMessage = logDocumentDeletion(req.userId, updatedDocument);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.documentId,
      'documents',
      existingDocumentById,
      {},
      {},
      logMessage
    );
    if (!updatedDocument) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete Document');
    }
    const logString = logger.info(`${req.userName} Deleted Documents with DocumentID - ${req.params.documentId}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.OK).send(updatedDocument);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Delete All the Documents with DocumentID - ${req.params.documentId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Delete the Documnet for the Provided ID ', details: error });
  }
});

function logDocumentDeletion(userId, updatedDocument) {
  const logMsg = `User ${userId} Deleted Document ${updatedDocument._id}`;
  return logMsg;
}

const documentOnForeignId = catchAsync(async (req, res) => {
  try {
    const documents = await documentsService.documentOnForeignId(req.params.foreignId, req.query);
    if (!documents) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Documents');
    }
    const logString = logger.info(`${req.userName} Accessed Documents with ForeignID - ${req.params.foreignId}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.OK).send(documents);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Documents with ForeignID - ${req.params.foreignId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Documents for the Given ForeignID', details: error });
  }
});

const documentsFilterOnCompanyidAndUseridAndStatus = catchAsync(async (req, res) => {
  const body = JSON.stringify(req.body);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const documents = await documentsService.documentsFilterOnCompanyidAndUseridAndStatus(req.query, req.body, page, limit, req.userId);
    const logString = logger.info(
      `${req.userName} Accessed Documents By filtering it on CompanyID / UserID / Status - ${body}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.json(documents);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Documents By filtering it on CompanyID / UserID / Status - ${body}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(500).json({ message: 'No Data available for the given Filter' });
  }
});

const getAllDocumentsForListingPage = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const documents = await documentsService.getAllDocumentsForListingPage(req.body, page, limit);
    const logString = logger.info(`${req.userName} Accessed All Documents for Listing Page`).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.json(documents);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All Documents for Listing Page, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(500).json({ message: 'No Data available for the given Filter' });
  }
});

const listOfDocumentStatus = catchAsync(async (req, res) => {
  try {
    const result = await documentsService.listOfDocumentStatus(req.query, req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Status');
    }
    const logString = logger.info(`${req.userName} Accesses the list of Status of Documents `).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Status of Documents, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Status of Documents ', details: error });
  }
});

const documentOnForeignIdAndIdentifier = catchAsync(async (req, res) => {
  try {
    const result = await documentsService.documentOnForeignIdAndIdentifier(req.body.foreign_id, req.body.identifier);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get Data');
    }
    const logString = logger.info(`${req.userName} Accesses Documents on ForeignID and Identifier `).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get the Documents, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to get theDocuments ', details: error });
  }
});

// cron.schedule('*/15 * * * * *', async () => {
cron.schedule(
  '0 2 * * *',
  async () => {
    const today = new Date();
    const expiryThreshold = 60;
    console.log('Running a task EveryDay at 2 am ', today);

    const statusUpdateDoc = await Documents.updateMany({}, [
      {
        $set: {
          doc_status: {
            $cond: {
              if: {
                $or: [{ $eq: ['$expiry', ''] }, { $eq: ['$expiry', null] }, { $eq: [{ $type: '$expiry' }, 'undefined'] }],
              },
              then: 'valid',
              else: {
                $cond: {
                  if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 0] },
                  then: 'expired',
                  else: {
                    $cond: {
                      if: { $lt: [{ $subtract: [{ $toDate: '$expiry' }, new Date()] }, 60 * 24 * 60 * 60 * 1000] },
                      then: 'soon expiring',
                      else: 'valid',
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);
    console.log('statusUpdateDoc ===>>> ', statusUpdateDoc);
  },
  {
    scheduled: true,
    timezone: 'Asia/Dubai',
  }
);

const triggerExpiry = catchAsync(async (req, res) => {
  try {
    const result = await documentsService.triggerExpiry();
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Trigger');
    }
    const logString = logger.info(`${req.userName} Accesses Documents on Expiry `).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get the Documents, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to get theDocuments ', details: error });
  }
});

const triggerIndividualExpiry = catchAsync(async (req, res) => {
  try {
    const result = await documentsService.triggerIndividualExpiry();
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Trigger');
    }
    const logString = logger.info(`${req.userName} Accesses Documents on Expiry `).transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get the Documents, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('documents', req.userId, logString);
    res.status(400).json({ message: 'Failed to get theDocuments ', details: error });
  }
});

cron.schedule(
  '0 0 * * *',
  async () => {
    const today = new Date();
    const expiryThreshold = 60;
    await documentsService.triggerExpiry();
    documentsService.triggerIndividualExpiry();
  },
  {
    scheduled: true,
    timezone: 'Asia/Dubai',
  }
);

const getDocumentsByForeignIdAndIdentifier = catchAsync(async (req, res)=>{
  try{
    const response = await documentsService.getDocumentsByForeignIdAndIdentifier(req.body.foreign_id, req.body.identifier);
    if(!response){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get Data');
    }
    res.status(httpStatus.OK).json(response);
  }catch(error){
    throw new Error(error)
  }
});
const getDocumentsByForeignIdAndType = catchAsync(async (req, res)=>{
  try{
    const response = await documentsService.getDocumentsByForeignIdAndType(req.body.foreign_id, req.body.type);
    if(!response){
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get Data');
    }
    res.status(httpStatus.OK).json(response);
  }catch(error){
    throw new Error(error)
  }
});

// Download document from S3 based on provided URL
const downloadDocument = catchAsync(async (req, res) => {
  try {
    const { fileUrl, fileName } = req.body;

    if (!fileUrl) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'File URL is required');
    }

    // Extract the S3 key from the URL
    // Expected format: https://bucket-name.s3.region.amazonaws.com/path/to/file.extension
    let fileKey;
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      if (pathParts.length < 2) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid file URL format');
      }
      fileKey = url.pathname.substring(1); // Remove leading slash
    } catch (error) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid file URL');
    }

    // Get file stream from S3
    const fileStream = await documentsService.getFileStream(fileKey);

    // Set headers for file download
    res.set({
      'Content-Disposition': `attachment; filename="${fileName || 'download'}"`,
      'Content-Type': 'application/octet-stream',
    });

    // Pipe the file stream directly to the response
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({
      code: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Error downloading file'
    });
  }
});

module.exports = {
  createRecord,
  triggerExpiry,
  createDocument,
  updateDocumentOnId,
  listAllDocuments,
  documentById,
  deleteDocument,
  documentOnForeignId,
  uploadDocumentsOnDocIdAndForeignId,
  simpleDocumentUpload,
  onboardingDocumentUpload,
  documentsFilterOnCompanyidAndUseridAndStatus,
  getAllDocumentsForListingPage,
  listOfDocumentStatus,
  documentOnForeignIdAndIdentifier,
  simpleDocumentUploadBase64,
  triggerIndividualExpiry,
  simpleDocumentUploadWithMimeTypes,
  getDocumentsByForeignIdAndIdentifier,
  getDocumentsByForeignIdAndType,
  downloadDocument
};
