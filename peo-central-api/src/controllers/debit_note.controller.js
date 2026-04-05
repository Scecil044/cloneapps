const httpStatus = require("http-status");
const { debitNoteService, loggerService} = require('../services');
const logger = require('../middlewares/logger');
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');

/**
 * ================================================================================================================================
 * Function to get all debit notes on the system
 * Note that this function expects a query object and a body object;
 * Query object can have search, page, limit, sort and sortBy
 * Body object can have selected_company_id, an array to filter by company id's
 * ================================================================================================================================
 */
const getAllDebitNotes = catchAsync( async(req, res)=>{
    try {
        const response = await debitNoteService.getAllDebitNotes(req.query, req.body);
        const logString = (logger.info(`${req.userName} Accessed the get all debit notes functionality`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not list debit notes');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        const logString = (logger.info(`${req.userName} failed to get all debit notes`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
  }
});

/**
 * ================================================================================================================================
 * Function to get debit note by id,
 * Note that this function expects a debit note id on params
 * ================================================================================================================================
 */
const findDebitNoteById = catchAsync(async(req, res)=>{
    try{
        const resonse = await debitNoteService.findDebitNoteById(req.params.debitNoteId);
        const logString = (logger.info(`${req.userName} Accessed the get debit note by id function: ${req.params.debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!resonse )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not get debit note');
        return res.status(httpStatus.OK).json(resonse);
    }catch(error){
        const logString = (logger.info(`${req.userName} failed to get debit note: ${req.params.debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
    }
})

/**
 * ================================================================================================================================
 * Function to create a new debit note
 * Function implementation expects body with all required fields
 * Validations done by Joi
 * ================================================================================================================================
 */
const generateDebitNote = catchAsync( async(req, res)=>{
    try {
        const body = {...req.body, userId: req.userId}
        const response = await debitNoteService.generateDebitNote(body);
        const logString = (logger.info(`${req.userName} Accessed the create debit note functionality for invoice ${req.body.invoice_number}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not create debit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to create debit note for invoice ${req.body.invoice_number}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
    }
});

const generateDebitNoteNumber = catchAsync(async(req, res)=>{
    try {
        const response = await debitNoteService.generateDebitNoteNumber();
        const logString = (logger.info(`${req.userName} Generated debit note number`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not generate debit note number');
        return res.status(httpStatus.OK).json({ debit_note_number: response });
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to generate debit note number`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
    }
});

const setupDebitNotePreview = catchAsync(async(req, res)=>{
    try {
        const body = {...req.body, userId: req.userId}
        const response = await debitNoteService.setupDebitNotePreview(body);
        const logString = (logger.info(`${req.userName} Setup debit note preview`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not setup debit note preview');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to setup debit note preview`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
    }
});

const checkExistingDraft = catchAsync(async(req, res)=>{
    try {
        const { invoiceId } = req.query;
        if (!invoiceId) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invoice ID is required' });
        }

        const existingDraft = await debitNoteService.getDraftDebitNoteByInvoiceId(invoiceId);
        const logString = (logger.info(`${req.userName} Checked for existing debit note draft for invoice ${invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);

        return res.status(httpStatus.OK).json({
            exists: !!existingDraft,
            debitNote: existingDraft
        });
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to check existing debit note draft`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
    }
});

const getAvailableDebitNotesByInvoiceId = catchAsync( async(req, res)=>{
    try {
        const body = {...req.body, userId: req.userId, invoiceId:req.params.invoiceId}
        const response = await debitNoteService.getAvailableDebitNotesByInvoiceId(body, req.query);
        const logString = (logger.info(`${req.userName} Accessed the get available debit notes for invoice ${req.body.invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not get available debit notes');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to available debit notes for invoice ${req.body.invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
  }
});

/**
 * ================================================================================================================================
 * Function to apply debit note while updating JE
 * This is the alternative option that should be preferred over the first one
 * ================================================================================================================================
 */
const applyDebitNote = catchAsync(async(req, res)=>{
    try {
        const response  = await debitNoteService.applyDebitNote(req.body, req.userId, req.userName);
        const logString = (logger.info(`${req.userName} Applied debit note ${req.body.debitNoteId} for amount AED ${req.body.amountToApply} to invoice ${req.body.invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not apply debit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        const logString = (logger.info(`${req.userName} failed to apply debit note ${req.body.debitNoteId} to invoice ${req.body.invoiceId}: ${error.message}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
  }
});

/**
 * ================================================================================================================================
 * Function to unapply/reverse a debit note application
 * This function reverses the application of a debit note with full transaction support
 * ================================================================================================================================
 */
const unapplyDebitNote = catchAsync(async(req, res)=>{
    try {
        const response  = await debitNoteService.unapplyDebitNote(req.body, req.userId, req.userName);
        const logString = (logger.info(`${req.userName} Reversed debit note ${req.body.debitNoteId} application for amount AED ${req.body.amountToReverse || 'full amount'} from invoice ${req.body.invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not unapply debit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        const logString = (logger.info(`${req.userName} failed to unapply debit note ${req.body.debitNoteId} from invoice ${req.body.invoiceId}: ${error.message}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);

        // Properly handle different error types
        if (error instanceof ApiError) {
            throw error;
        } else if (error.name === 'ValidationError') {
            throw new ApiError(httpStatus.BAD_REQUEST, error.message);
        } else if (error.name === 'CastError') {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid ID format');
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
        }
  }
});

/**
 * ================================================================================================================================
 * Function to update debit note
 * The function expects a debit note id and body with relevant fields to update
 * Validations done by Joi
 * ================================================================================================================================
 */
const updateDebitNote = catchAsync( async(req, res)=>{
    try {
        console.log('=== UPDATE DEBIT NOTE CONTROLLER ===');
        console.log('req.params:', req.params);
        console.log('req.params.debitNoteId:', req.params.debitNoteId);
        console.log('req.body:', req.body);

        const response = await debitNoteService.updateDebitNote(req.params.debitNoteId, req.body);
        const logString = (logger.info(`${req.userName} Accessed the update debit note functionality ${req.params.debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not update debit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log('=== UPDATE DEBIT NOTE ERROR ===');
        console.log('Error:', error);
        console.log('req.params.debitNoteId:', req.params.debitNoteId);
        const logString = (logger.info(`${req.userName} failed to update debit for debit note: ${req.params.debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
  }
});

/**
 * ================================================================================================================================
 * Function to mark debit note as deleted
 * the function expects debit note id on params
 * ================================================================================================================================
 */
const deleteDebitNote = catchAsync( async(req, res)=>{
    try{
        const response = await debitNoteService.deleteDebitNote(req.params.debitNoteId, req.userId);
        const logString = (logger.info(`${req.userName} Accessed the delete debit note functionality for debit note: ${req.params.debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not delete debit note');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = (logger.info(`${req.userName} failed to delete debit note: ${req.params.debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
    }
})

/**
 * ================================================================================================================================
 * Function to generate pdf preview for debit notes
 * Note that this function expects req.params to have debitNoteId
 * ================================================================================================================================
 */
const getDebitNotePdfPreview = catchAsync(async(req, res)=>{
    try{
        // Handle both GET (params) and POST (body) requests
        const debitNoteId = req.params.debitNoteId || req.body.debit_note_id;

        if (!debitNoteId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Debit note ID is required');
        }

        const response = await debitNoteService.getDebitNotePdfPreview(debitNoteId);
        const logString = (logger.info(`${req.userName} Accessed the get debit note preview for debit note:: ${debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.BAD_REQUEST, 'Could not get debit note preview');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const debitNoteId = req.params.debitNoteId || req.body.debit_note_id;
        const logString = (logger.info(`${req.userName} failed to get debit note preview for debit note: ${debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        console.log(error);
        throw new Error(error);
  }
});

/**
 * ================================================================================================================================
 * Function to get debit notes by status
 * The function expects a status array or string in req.body
 * ================================================================================================================================
 */
const filterDebitNotesByStatus = catchAsync(async(req, res)=>{
    try{
        const response = await debitNoteService.filterDebitNotesByStatus(req.body);
        const logString = (logger.info(`${req.userName} Accessed the filter debit notes by status functionality`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not filter debit notes by status');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = (logger.info(`${req.userName} failed to filter debit notes by status`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
    }
});

/**
 * ================================================================================================================================
 * Function to generate app preview for debit notes
 * Note that this function expects req.params to have debitNoteId
 * ================================================================================================================================
 */
const getDebitNotePreview = catchAsync(async(req, res)=>{
    try{
        const response = await debitNoteService.getDebitNotePreview(req.params.debitNoteId);
        const logString = (logger.info(`${req.userName} Accessed the debit notes preview route`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not preview debit note');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = (logger.info(`${req.userName} failed to get debit note preview`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
  }
});

/**
 * ================================================================================================================================
 * Function get debit note statistics from the system
 * The result of this function organizes debit notes based on status
 * Note that the returned json also includes the remaining balances from debit notes
 * ================================================================================================================================
 */
const getDebitNoteStats = catchAsync(async(req, res)=>{
    try{
        const response = await debitNoteService.getDebitNoteStats(req.body);
        const logString = (logger.info(`${req.userName} Accessed the debit notes stats route`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not get debit notes stats');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = (logger.info(`${req.userName} failed to get debit notes stats`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
    }
})

const approveDebitNote = catchAsync(async(req, res)=>{
    try {
        const { debitNoteId } = req.body;
        const response = await debitNoteService.approveDebitNote(debitNoteId, req.userId);
        const logString = (logger.info(`${req.userName} Approved debit note ${debitNoteId}`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        if (!response) throw new ApiError(httpStatus.FORBIDDEN, 'Could not approve debit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to approve debit note`)).transports[0].logString;
        await loggerService.createLogger('debit_note', req.userId, logString);
        throw new Error(error);
    }
});

const checkExistingDebitNote = catchAsync(async (req, res) => {
    try {
        const { company, invoice } = req.query;
        if (!company || !invoice) {
            return res.status(400).json({ message: 'Company and invoice parameters are required' });
        }

        const response = await debitNoteService.checkExistingDebitNote(company, invoice);
        const logString = logger.info(`${req.userName} checked for existing debit note for company ${company} and invoice ${invoice}`).transports[0].logString;
        await loggerService.createLogger('debit_notes', req.userId, logString);
        res.status(httpStatus.OK).json(response);
  } catch (error) {
        const logString = logger.error(`${req.userName} failed to check existing debit note => ${error && error.message ? error.message : 'Unknown error'}`).transports[0].logString;
        await loggerService.createLogger('debit_notes', req.userId, logString);
        res.status(400).json({ message: 'Failed to check existing debit note', details: error && error.message ? error.message : 'Unknown error' });
    }
});

const voidDebitNote = catchAsync(async (req, res) => {
    try {
        const { debitNoteId } = req.params;
        const { void_reason } = req.body;

        if (!void_reason) {
            return res.status(400).json({ message: 'Void reason is required' });
        }

        const response = await debitNoteService.voidDebitNote(debitNoteId, void_reason, req.userId);
        const logString = logger.info(`${req.userName} voided debit note ${debitNoteId}`).transports[0].logString;
        await loggerService.createLogger('debit_notes', req.userId, logString);
        res.status(httpStatus.OK).json(response);
  } catch (error) {
        const logString = logger.error(`${req.userName} failed to void debit note => ${error && error.message ? error.message : 'Unknown error'}`).transports[0].logString;
        await loggerService.createLogger('debit_notes', req.userId, logString);
        res.status(400).json({ message: 'Failed to void debit note', details: error && error.message ? error.message : 'Unknown error' });
  }
});

module.exports = {
    generateDebitNote,
    generateDebitNoteNumber,
    setupDebitNotePreview,
    deleteDebitNote,
  getAllDebitNotes,
  findDebitNoteById,
    applyDebitNote,
    unapplyDebitNote,
  updateDebitNote,
  getDebitNotePdfPreview,
  filterDebitNotesByStatus,
  getDebitNoteStats,
    getDebitNotePreview,
    getAvailableDebitNotesByInvoiceId,
    approveDebitNote,
    checkExistingDebitNote,
    setupDebitNotePreview,
    checkExistingDraft,
    voidDebitNote
}
