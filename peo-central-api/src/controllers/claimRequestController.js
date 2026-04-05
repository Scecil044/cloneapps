const catchAsync = require('../utils/catchAsync');
const logger = require('../middlewares/logger');
const { claimRequestService, loggerService } = require("../services")

// Create a new Claim Request
const createClaimRequest = catchAsync(async (req, res) => {
    try {
        const claimRequest = await claimRequestService.createClaimRequest(req.body, req.headers.host)
        const logString = (logger.info(`Created new Claim Request with ID ${claimRequest._id}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data, validate: claimRequest?.validate })
    } catch (error) {
        console.log(error)
        const logString = (logger.error(`Failed to Create Claim Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to create Claim Request. Please Check the Input', error })
    }
});

// Create a new Claim Request
const deleteClaimDraftRequest = catchAsync(async (req, res) => {
    try {
        const { draftId } = req.params
        const claimRequest = await claimRequestService.deleteClaimDraftRequest(draftId)
        const logString = (logger.info(`Deleted Claim Draft with ID ${draftId}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data, validate: claimRequest?.validate })
    } catch (error) {
        console.log(error)
        const logString = (logger.error(`Failed to delete Claim Draft, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to delete Claim Draft. Please Check the Input', error })
    }
});

// Withdraw a Claim Request
const withdrawClaimRequest = catchAsync(async (req, res) => {
    try {
        const claimRequest = await claimRequestService.withdrawClaimRequest(req.body);
        const logString = (logger.info(`Claim Request Withdrawn`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data })
    } catch (error) {
        conosle.log(error)
        const logString = (logger.error(`Failed to Withdraw Claim Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to withdraw Claim Request. Please Check the Input', error })
    }
})

// Approve a Claim Request
const approveClaimRequest = catchAsync(async (req, res) => {
    try {
        const claimRequest = await claimRequestService.approveClaimRequest(req.body, req.headers.host);
        const logString = (logger.info(`Claim Request Approved`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Approve Claim Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to approve Claim Request. Please Check the Input', error })
    }
})

// Reject Claim Request
const rejectClaimRequest = catchAsync(async (req, res) => {
    try {
        const claimRequest = await claimRequestService.rejectClaimRequest(req.body, req.headers.host);
        const logString = (logger.info(`Claim Request Rejected`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Reject Claim Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        console.log(error);
        throw new Error(error);
    }
})

// Reject Claim Request
const reassignClaimRequest = catchAsync(async (req, res) => {
    try {
        const claimRequest = await claimRequestService.reassignClaimRequest(req.body, req.headers.host);
        const logString = (logger.info(`Claim Request Reassigned`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Reassign Claim Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to Reassign Claim Request. Please Check the Input', error })
    }
})

// Requires Clarification Clain Request
const requiresClarificationClaimRequest = catchAsync(async (req, res) => {
    try {
        const claimRequest = await claimRequestService.requiresClarificationClaimRequest(req.body, req.headers.host);
        const logString = (logger.info(`Claim Request Requires Clarification`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Request Clarification this Claim Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to Request Clarification this Claim Request. Please Check the Input', error })
    }
})

// Request to Clarify the Request Being send for Clarification
const clarifyClaimRequest = catchAsync(async (req, res) => {
    try {
        const claimRequest = await claimRequestService.clarifyClaimRequest(req.body, req.headers.host);
        const logString = (logger.info(`Claim Request Clarified`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Clarified this Claim Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to Clarified this Claim Request. Please Check the Input', error })
    }
})

// Get Claim Types
const getClaimtypes = catchAsync(async (req, res) => {
    try {
        req.body.type = req?.body?.type || null
        req.query.isArray = req?.query?.isArray || true
        const claimRequest = await claimRequestService.getClaimtypes(req?.params?.userId, req?.query);
        const logString = (logger.info(`Claim Types`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Get Claim Types, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to Get Claim Types. Please Check the Input', error })
    }
})

// Get Claim Sub Types
const getClaimsubtypes = catchAsync(async (req, res) => {
    try {
        req.body.type = req?.body?.type || null
        req.query.isArray = req?.query?.isArray || false
        const claimRequest = await claimRequestService.getClaimtypes(req?.params?.userId, req?.query, true);
        const logString = (logger.info(`Claim Types`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Get Claim Sub Types, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to Get Claim Sub Types. Please Check the Input', error })
    }
})

const getClaimReceipt = catchAsync(async (req, res) => {
    try {
        const claimRequest = await claimRequestService.getClaimReceipt(req?.params?.claimId);
        const logString = (logger.info(`Claim Receipt File`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: claimRequest?.success, message: claimRequest?.message, data: claimRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Get Claim Receipt File, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claim_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to Get Claim Receipt File. Please Check the Input', error })
    }
})

module.exports = {
    createClaimRequest,
    deleteClaimDraftRequest,
    withdrawClaimRequest,
    approveClaimRequest,
    rejectClaimRequest,
    reassignClaimRequest,
    requiresClarificationClaimRequest,
    clarifyClaimRequest,
    getClaimtypes,
    getClaimsubtypes,
    getClaimReceipt
}
