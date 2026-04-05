const { invoiceLogService } = require('../services');
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");

const createInvoiceLog = catchAsync(async (req, res) => {
    try {
        const result = await invoiceLogService.createInvoiceLog(req.body)
        const logString = (logger.info(`Invoice Log Created for the module ${req.body.module} with ID being ${result._id}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(httpStatus.CREATED).send(result);
    } catch (error) {
        const logString = (logger.error(`Failed to Create Invoice Log Log for the module ${req.body.module}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(400).json({ message: 'Failed to create Invoice Log. Please Check the Input', details: error });
    }
});

const updateInvoiceLogOnId = catchAsync(async (req, res) => {
    try {
        const result = await invoiceLogService.updateInvoiceLogOnId(req.params.invoicelogId, req.body)
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Invoice Log');
        }
        const logString = (logger.info(`${req.userName} Updated an Invoice Log with ID ${req.params.invoicelogId}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update an Invoice Log with ID ${req.params.invoicelogId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Invoice Log. Please Check the Input', details: error });
    }
});

const listAllInvoiceLogs = catchAsync(async (req, res) => {
    try {
        const result = await invoiceLogService.listAllInvoiceLogs()
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Invoice Logs');
        }
        const logString = (logger.info(`${req.userName} Accessed All the Invoice Logs`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access All the Invoice Logs, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch All Invoice Logs', details: error });
    }
});

const invoiceLogByID = catchAsync(async (req, res) => {
    try {
        const result = await invoiceLogService.invoiceLogByID(req.params.invoicelogId)
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Invoice Log');
        }
        const logString = (logger.info(`${req.userName} Accessed Invoice Log for the following Invoice Log ID - ${req.params.invoicelogId}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access All the Invoice Logs for the ID ${req.params.invoicelogId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Invoice Log for the Given ID', details: error });
    }
});

const deleteInvoiceLogOnId = catchAsync(async (req, res) => {
    try {
        const result = await invoiceLogService.deleteInvoiceLogOnId(req.params.invoicelogId)
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete Invoice Log');
        }
        const logString = (logger.info(`${req.userName} Deleted Invoice Log with ID - ${req.params.invoicelogId}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(httpStatus.OK).send(result);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete the Invoice Log with ID ${req.params.invoicelogId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete Invocie Log for the Given ID', details: error });
    }
});

const getInvoiceLogsByDocumentId = catchAsync(async (req, res) => {
    try {
        const result = await invoiceLogService.getInvoiceLogsByDocumentId(req.params.documentId)
        const logString = (logger.info(`${req.userName} Accessed Invoice Logs for Document ID - ${req.params.documentId}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Invoice Logs for Document ID ${req.params.documentId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('invoicelog', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Invoice Logs for the Given Document ID', details: error });
    }
});

module.exports = {
    createInvoiceLog,
    updateInvoiceLogOnId,
    listAllInvoiceLogs,
    invoiceLogByID,
    deleteInvoiceLogOnId,
    getInvoiceLogsByDocumentId
}
