const httpStatus = require("http-status");
const { creditNoteService, loggerService} = require('../services');
const logger = require('../middlewares/logger');
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');

/**
 * ================================================================================================================================
 * Function to get all credit notes on the system
 * Note that this function expects a query object and a body object;
 * Query object can have search, page, limit, sort and sortBy
 * Body object can have selected_company_id, an array to filter by company id's
 * ================================================================================================================================
 */
const getAllCreditNotes = catchAsync( async(req, res)=>{
    try {
        const response = await creditNoteService.getAllCreditNotes(req.query, req.body);
        const logString = (logger.info(`${req.userName} Accessed the get all credit notes functionality`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not list credit notes');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        const logString = (logger.info(`${req.userName} failed to get all credit notes`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

/**
 * ================================================================================================================================
 * Function to get credit note by id,
 * Note that this function expects a credit note id on params
 * ================================================================================================================================
 */
const findCreditNoteById = catchAsync(async(req, res)=>{
    try{
        const resonse = await creditNoteService.findCreditNoteById(req.params.creditNoteId);
        const logString = (logger.info(`${req.userName} Accessed the get credit not by id function: ${req.params.creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!resonse )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not get credit note');
        return res.status(httpStatus.OK).json(resonse);
    }catch(error){
        const logString = (logger.info(`${req.userName} failed to get credit note: ${req.params.creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
})
/**
 * ================================================================================================================================
 * Function to create a new credit note
 * Function implementation expects body with all required fields
 * Validations done by Joi
 * ================================================================================================================================
 */
const generateCreditNote = catchAsync( async(req, res)=>{
    try {
        const body = {...req.body, userId: req.userId}
        const response = await creditNoteService.generateCreditNote(body);
        const logString = (logger.info(`${req.userName} Accessed the create credit note functionality for invoice ${req.body.invoice_number}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not create credit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to create credit note for invoice ${req.body.invoice_number}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

const generateCreditNoteNumber = catchAsync(async(req, res)=>{
    try {
        const response = await creditNoteService.generateCreditNoteNumber();
        const logString = (logger.info(`${req.userName} Generated credit note number`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not generate credit note number');
        return res.status(httpStatus.OK).json({ credit_note_number: response });
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to generate credit note number`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

const setupCreditNotePreview = catchAsync(async(req, res)=>{
    try {
        console.log('🔍 [controller] setupCreditNotePreview - req.body:', JSON.stringify(req.body, null, 2));
        console.log('🔍 [controller] req.body.invoice_id:', req.body.invoice_id, 'type:', typeof req.body.invoice_id);
        console.log('🔍 [controller] req.body.invoice:', req.body.invoice, 'type:', typeof req.body.invoice);
        
        const body = {...req.body, userId: req.userId}
        console.log('🔍 [controller] body after spread:', JSON.stringify(body, null, 2));
        
        const response = await creditNoteService.setupCreditNotePreview(body);
        const logString = (logger.info(`${req.userName} Setup credit note preview`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not setup credit note preview');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log('🔍 [controller] Error in setupCreditNotePreview:', error);
        console.log('🔍 [controller] Error message:', error.message);
        console.log('🔍 [controller] Error stack:', error.stack);
        const logString = (logger.info(`${req.userName} failed to setup credit note preview`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

const checkExistingDraft = catchAsync(async(req, res)=>{
    try {
        const { invoiceId } = req.query;
        if (!invoiceId) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invoice ID is required' });
        }

        const existingDraft = await creditNoteService.getDraftCreditNoteByInvoiceId(invoiceId);
        const logString = (logger.info(`${req.userName} Checked for existing credit note draft for invoice ${invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);

        return res.status(httpStatus.OK).json({
            exists: !!existingDraft,
            creditNote: existingDraft
        });
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to check existing credit note draft`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

const getAvailableCreditNotesByInvoiceId = catchAsync( async(req, res)=>{
    try {
        const body = {...req.body, userId: req.userId, invoiceId:req.params.invoiceId}
        const response = await creditNoteService.getAvailableCreditNotesByInvoiceId(body, req.query);
        const logString = (logger.info(`${req.userName} Accessed the get available credit notes for invoice ${req.body.invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not get availlable credit notes');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to available credit notes for invoice ${req.body.invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

/**
 * ================================================================================================================================
 * Function to apply credit note while updating JE
 * This is the alternative option that should be prefreed over the first one
 * ================================================================================================================================
 */
const applyCreditNote = catchAsync(async(req, res)=>{
    try {
        const response  = await creditNoteService.applyCreditNote(req.body, req.userId, req.userName);
        const logString = (logger.info(`${req.userName} Applied credit note ${req.body.creditNoteId} for amount AED ${req.body.amountToApply} to invoice ${req.body.invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not apply credit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        const logString = (logger.info(`${req.userName} failed to apply credit note ${req.body.creditNoteId} to invoice ${req.body.invoiceId}: ${error.message}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

/**
 * ================================================================================================================================
 * Function to unapply/reverse a credit note application
 * This function reverses the application of a credit note with full transaction support
 * ================================================================================================================================
 */
const unapplyCreditNote = catchAsync(async(req, res)=>{
    try {
        const response  = await creditNoteService.unapplyCreditNote(req.body, req.userId, req.userName);
        const logString = (logger.info(`${req.userName} Reversed credit note ${req.body.creditNoteId} application for amount AED ${req.body.amountToReverse || 'full amount'} from invoice ${req.body.invoiceId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not unapply credit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        const logString = (logger.info(`${req.userName} failed to unapply credit note ${req.body.creditNoteId} from invoice ${req.body.invoiceId}: ${error.message}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

/**
 * ================================================================================================================================
 * Function to update credit note
 * The function expects a credit note id and body with relevant fields to update
 * Validations done by Joi
 * ================================================================================================================================
 */
const updateCreditNote = catchAsync( async(req, res)=>{
    try {
        console.log('=== UPDATE CREDIT NOTE CONTROLLER ===');
        console.log('req.params:', req.params);
        console.log('req.params.creditNoteId:', req.params.creditNoteId);
        console.log('req.body:', req.body);

        const response = await creditNoteService.updateCreditNote(req.params.creditNoteId, req.body);
        const logString = (logger.info(`${req.userName} Accessed the update credit credit note functionality ${req.params.creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not update credit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log('=== UPDATE CREDIT NOTE ERROR ===');
        console.log('Error:', error);
        console.log('req.params.creditNoteId:', req.params.creditNoteId);
        const logString = (logger.info(`${req.userName} failed to update credit for credit note: ${req.params.creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});
/**
 * ================================================================================================================================
 * Function to mark credit note as deleted
 * the function expects credit note id on params
 * ================================================================================================================================
 */
const deleteCreditNote = catchAsync( async(req, res)=>{
    try{
        const response = await creditNoteService.deleteCreditNote(req.params.creditNoteId, req.userId);
        const logString = (logger.info(`${req.userName} Accessed the delete credit note functionality for credit note: ${req.params.creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not delete credit note');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = (logger.info(`${req.userName} failed to delete credit note: ${req.params.creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
})
/**
 * ================================================================================================================================
 * Function to generate pdf preview for credit notes
 * Note that this function expects req.params to have creditNoteId
 * ================================================================================================================================
 */
const getCreditNotePdfPreview = catchAsync(async(req, res)=>{
    try{
        // Handle both GET (params) and POST (body) requests
        const creditNoteId = req.params.creditNoteId || req.body.credit_note_id || req.body.creditNoteId;

        if (!creditNoteId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Credit note ID is required');
        }

        const response = await creditNoteService.getCreditNotePdfPreview(creditNoteId);
        const logString = (logger.info(`${req.userName} Accessed the get credit note preview for credit note:: ${creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.BAD_REQUEST, 'Could not get credit note preview');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const creditNoteId = req.params.creditNoteId || req.body.credit_note_id || req.body.creditNoteId;
        const logString = (logger.info(`${req.userName} failed to get credit note preview for credit note: ${creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        console.log(error);
        throw new Error(error);
    }
});
/**
 * ================================================================================================================================
 * Function to get credit notes by status
 * The function expects a status array or string in req.body
 * ================================================================================================================================
 */
const filterCreditNotesByStatus = catchAsync(async(req, res)=>{
    try{
        const response = await creditNoteService.filterCreditNotesByStatus(req.body);
        const logString = (logger.info(`${req.userName} Accessed the filter credit notes by status functionality`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not filter credit notes by status');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = (logger.info(`${req.userName} failed to filter credit notes by status`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});
/**
 * ================================================================================================================================
 * Function to generate app preview for credit notes
 * Note that this function expects req.params to have creditNoteId
 * ================================================================================================================================
 */
const getCreditNotePreview = catchAsync(async(req, res)=>{
    try{
        // Handle both GET (params) and POST (body) requests
        const creditNoteId = req.params.creditNoteId || req.body.credit_note_id || req.body.creditNoteId;
        
        if (!creditNoteId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Credit note ID is required');
        }
        
        const response = await creditNoteService.getCreditNotePreview(creditNoteId);
        const logString = (logger.info(`${req.userName} Accessed the credit notes preview route for credit note: ${creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not preview credit note');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const creditNoteId = req.params.creditNoteId || req.body.credit_note_id || req.body.creditNoteId;
        const logString = (logger.info(`${req.userName} failed to get credit note preview for credit note: ${creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

/**
 * ================================================================================================================================
 * Function get credit note statistics from the system
 * The result of this function organizes credit notes based on status
 * Note that the returned json also includes the remining balances from credit notes
 * ================================================================================================================================
 */
const getCreditNoteStats = catchAsync(async(req, res)=>{
    try{
        const response = await creditNoteService.getCreditNoteStats(req.body);
        const logString = (logger.info(`${req.userName} Accessed the credit notes stats route`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response )  throw new ApiError(httpStatus.FORBIDDEN, 'Could not get credit notes stats');
        return res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = (logger.info(`${req.userName} failed to get credit notes stats`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
})

const approveCreditNote = catchAsync(async(req, res)=>{
    try {
        const { creditNoteId } = req.body;
        const response = await creditNoteService.approveCreditNote(creditNoteId, req.userId);
        const logString = (logger.info(`${req.userName} Approved credit note ${creditNoteId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response) throw new ApiError(httpStatus.FORBIDDEN, 'Could not approve credit note');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        console.log(error)
        const logString = (logger.info(`${req.userName} failed to approve credit note`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

const checkExistingCreditNote = catchAsync(async (req, res) => {
    try {
        const { company, invoice } = req.query;
        if (!company || !invoice) {
            return res.status(400).json({ message: 'Company and invoice parameters are required' });
        }

        const response = await creditNoteService.checkExistingCreditNote(company, invoice);
        const logString = logger.info(`${req.userName} checked for existing credit note for company ${company} and invoice ${invoice}`).transports[0].logString;
        await loggerService.createLogger('credit_notes', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to check existing credit note => ${error && error.message ? error.message : 'Unknown error'}`).transports[0].logString;
        await loggerService.createLogger('credit_notes', req.userId, logString);
        res.status(400).json({ message: 'Failed to check existing credit note', details: error?.message });
    }
});

const voidCreditNote = catchAsync(async (req, res) => {
    try {
        const { creditNoteId } = req.params;
        const { void_reason } = req.body;

        if (!void_reason) {
            return res.status(400).json({ message: 'Void reason is required' });
        }

        const response = await creditNoteService.voidCreditNote(creditNoteId, void_reason, req.userId);
        const logString = logger.info(`${req.userName} voided credit note ${creditNoteId}`).transports[0].logString;
        await loggerService.createLogger('credit_notes', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to void credit note => ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('credit_notes', req.userId, logString);
        res.status(400).json({ message: 'Failed to void credit note', details: error?.message });
    }
});

const getAvailableCustomCreditNotes = catchAsync(async(req, res)=>{
    try {
        const { customerId, invoiceId } = req.query;
        if (!customerId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Customer ID is required');
        }
        const response = await creditNoteService.getAvailableCustomCreditNotes(customerId, invoiceId);
        const logString = (logger.info(`${req.userName} Accessed available custom credit notes for customer ${customerId}`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        if (!response) throw new ApiError(httpStatus.FORBIDDEN, 'Could not get available custom credit notes');
        return res.status(httpStatus.OK).json(response);
    } catch(error){
        const logString = (logger.info(`${req.userName} failed to get available custom credit notes`)).transports[0].logString;
        await loggerService.createLogger('credit_note', req.userId, logString);
        throw new Error(error);
    }
});

module.exports = {
    generateCreditNote,
    generateCreditNoteNumber,
    setupCreditNotePreview,
    deleteCreditNote,
    getAllCreditNotes,
    findCreditNoteById,
    applyCreditNote,
    unapplyCreditNote,
    updateCreditNote,
    getCreditNotePdfPreview,
    filterCreditNotesByStatus,
    getCreditNoteStats,
    getCreditNotePreview,
    getAvailableCreditNotesByInvoiceId,
    approveCreditNote,
    checkExistingCreditNote,
    setupCreditNotePreview,
    checkExistingDraft,
    voidCreditNote,
    getAvailableCustomCreditNotes
}
