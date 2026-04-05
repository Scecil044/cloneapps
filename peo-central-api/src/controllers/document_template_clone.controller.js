const httpStatus = require('http-status');
const { documentTemplateCloneService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const logger = require('../middlewares/logger');
const { loggerService } = require('../services');

const getTemplate = catchAsync(async (req, res) => {
    try {
        const document = await documentTemplateCloneService.getDocumentTemplate(req.params, req.body);
        const logString = (logger.info(`${req.userName} Accessed the Document Template Clone`)).transports[0].logString;
        await loggerService.createLogger('document_template_clone', req.userId, logString);
        const SaveAsPDF = await documentTemplateCloneService.getReplacedContentSavePDF(req.params._id, req.body);
        res.status(httpStatus.OK).send(document);

    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get Document Template Clone, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('document_template_clone', req.userId, logString);
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get Document Template Clone', details: error?.message });
    }
});



const editTemplate = catchAsync(async (req, res) => {
    try {
        const document_id = await documentTemplateCloneService.editDocumentTemplate(req.params, req.body);
        const logString = (logger.info(`${req.userName} Accessed the Document Template Clone`)).transports[0].logString;
        await loggerService.createLogger('document_template_clone', req.userId, logString);
        const SaveAsPDF = await documentTemplateCloneService.getReplacedContentSavePDF(document_id, req.body);
        res.status(httpStatus.OK).send(SaveAsPDF);

    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get Document Template Clone, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('document_template_clone', req.userId, logString);
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get Document Template Clone', details: error });
    }
});

// const editTemplate = catchAsync(async (req, res) => {
//     try {
//         const document_id = await documentTemplateCloneService.editDocumentTemplate(req.params, req.body);
//         const logString = (logger.info(`${req.userName} Accessed the Document Template Clone`)).transports[0].logString;
//         await loggerService.createLogger('document_template_clone', req.userId, logString);
//         const SaveAsPDF = await documentTemplateCloneService.getReplacedContentSavePDF(document_id, req.body);
//         res.status(httpStatus.OK).send(SaveAsPDF);

//     } catch (error) {
//         const logString = (logger.error(`${req.userName} Failed to get Document Template Clone, encountered following error => ${error}`)).transports[0].logString;
//         await loggerService.createLogger('document_template_clone', req.userId, logString);
//         res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get Document Template Clone', details: error });
//     }
// });

const getDocTemplateOnIDWithoutContent = catchAsync(async (req, res) => {
  try {
    const document = await documentTemplateCloneService.getDocTemplateOnIDWithoutContent(req.params.DocTempltCloneID);
    const logString = logger.info(
      `${req.userName} Accessed Document Template Clone with ID - ${req.params.DocTempltCloneID}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(httpStatus.OK).send(document);
  } catch (error) {
    console.log('===========', error);
    const logString = logger.error(
      `${req.userName} Failed to get Document Template Clone with ID - ${req.params.DocTempltCloneID}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Failed to get Documents Template for the given ID', details: error });
  }
});

const getReplacedContent = catchAsync(async (req, res) => {
  try {
    const document = await documentTemplateCloneService.getReplacedContent(req.params.DocTempltCloneID);
    const logString = logger.info(
      `${req.userName} Accessed Document Template Clone with ID - ${req.params.DocTempltCloneID}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(httpStatus.OK).send(document);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get Document Template Clone with ID - ${req.params.DocTempltCloneID}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Failed to get Documents Template for the given ID', details: error });
  }
});

const getReplacedContentFile = catchAsync(async (req, res) => {
  try {
    const document = await documentTemplateCloneService.getReplacedContentFile(req.params.DocTempltCloneID);
    const logString = logger.info(
      `${req.userName} Accessed Document Template Clone with ID - ${req.params.DocTempltCloneID}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(httpStatus.OK).send(document);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get Document Template Clone with ID - ${req.params.DocTempltCloneID}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Failed to get Documents Template for the given ID', details: error });
  }
});

const createDocumentTemplateClone = catchAsync(async (req, res) => {
  try {
    const result = await documentTemplateCloneService.createDocumentTemplateClone(req.body);
    const logString = logger.info(`${req.userName} Created a new Document Template Clone`).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(httpStatus.CREATED).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Create a new Document Template Clone, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(400).json({ message: 'Failed to create a new Document Template Clone', details: error });
  }
});

const listAllDocumentTemplateClone = catchAsync(async (req, res) => {
  try {
    const result = await documentTemplateCloneService.listAllDocumentTemplateClone();
    const logString = logger.info(`${req.userName} Access all document template clones`).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Get all Document Template Clones, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(400).json({ message: 'Failed to Get all Document Template Clones', details: error });
  }
});

const getDocumentTemplateCloneById = catchAsync(async (req, res) => {
  try {
    const result = await documentTemplateCloneService.getDocumentTemplateCloneById(req.params.cloneID);
    const logString = logger.info(`${req.userName} Accessed Document Template Clone with ID - ${req.params.cloneID}`)
      .transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Get Document Template Clone with ID - ${req.params.cloneID}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(400).json({ message: 'Failed to Get Document Template Clone for the given ID ', details: error });
  }
});

const updateDocumentTemplateCloneOnId = catchAsync(async (req, res) => {
  try {
    const result = await documentTemplateCloneService.updateDocumentTemplateCloneOnId(req.params.cloneID, req.body);
    const logString = logger.info(`${req.userName} Updated Document Template Clone with ID - ${req.params.cloneID}`)
      .transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Document Template Clone with ID - ${req.params.cloneID}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('document_template_clone', req.userId, logString);
    res.status(400).json({ message: 'Failed to Update Document Template Clone for the given ID ', details: error });
  }
});

const getWorkOrderCount = catchAsync(async (req, res) => {
    try {
        const result = await documentTemplateCloneService.CalculateWorkOrder(req.params.type, req.body);
        const logString = (logger.info(`${req.userName} Unable to get the Work order Count - ${req.params.cloneID}`)).transports[0].logString;
        await loggerService.createLogger('document_template_clone', req.userId, logString);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Work order Count- ${req.params.cloneID}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('document_template_clone', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Work order Count', details: error });
    }
});

module.exports = {
    getTemplate,
    createDocumentTemplateClone,
    listAllDocumentTemplateClone,
    getDocumentTemplateCloneById,
    updateDocumentTemplateCloneOnId,
    getDocTemplateOnIDWithoutContent,
    getReplacedContent,
    getReplacedContentFile,
    getWorkOrderCount,
    editTemplate
}