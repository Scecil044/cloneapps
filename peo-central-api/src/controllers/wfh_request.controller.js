const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/loggers');
const { wfhRequestService, loggerService} = require('../services');

const createWfhRequest = catchAsync(async (req, res) => {
    try {
        const wfhRequest = await wfhRequestService.createWfhRequest(req.body, req.headers.host)
        const logString = (logger.info(`Created new WFH Request with ID ${wfhRequest._id}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: wfhRequest?.success, message: wfhRequest?.message, data: wfhRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Create WFH Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to create WFH Request. Please Check the Input', error })
    }
});

// Withdraw a WFH Request
const withdrawWfhRequest = catchAsync(async (req, res) => {
    try {
        const wfhRequest = await wfhRequestService.withdrawWfhRequest(req.body)
        const logString = (logger.info(`WFH Request Withdrawn`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: wfhRequest?.success, message: wfhRequest?.message, data: wfhRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Withdraw WFH Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to withdraw WFH Request. Please Check the Input', error })
    }
})

// Approve WFH Request
const approveWfhRequest = catchAsync(async (req, res) => {
    try {
        const wfhRequest = await wfhRequestService.approveWfhRequest(req.body, req.headers.host)
        const logString = (logger.info(`WFH Request Approved`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: wfhRequest?.success, message: wfhRequest?.message, data: wfhRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Approve WFH Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to approve WFH Request. Please Check the Input', error })
    }
})

// Reject WFH Request
const rejectWfhRequest = catchAsync(async (req, res) => {
    try {
        const wfhRequest = await wfhRequestService.rejectWfhRequest(req.body, req.headers.host)
        const logString = (logger.info(`WFH Request Rejected`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: wfhRequest?.success, message: wfhRequest?.message, data: wfhRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Reject WFH Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to reject WFH Request. Please Check the Input', error })
    }
})

// Reassign WFH Request
const reassignWfhRequest = catchAsync(async (req, res) => {
    try {
        const wfhRequest = await wfhRequestService.reassignWfhRequest(req.body, req.headers.host)
        const logString = (logger.info(`WFH Request Reassigned`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: wfhRequest?.success, message: wfhRequest?.message, data: wfhRequest?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Reassign WFH Request, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to reassign WFH Request. Please Check the Input', error })
    }
})

// Get the Total WorkFrom Home Counts of the User
const getUserWfhCount = catchAsync(async (req, res) => {
    try {
        const result = await wfhRequestService.getUserWfhCount(req?.body)
        const logString = (logger.info(`WFH Counts of a User`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(httpStatus.OK).json({ success: result?.success, message: result?.message, data: result?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to Fetch total WFH Counts, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to Get WFH Counts', error })
    }
})

const getAllWFHRequests = catchAsync(async (req, res) => {
    try {
        const result = await wfhRequestService.getAllWFHRequests(req?.body)
        const logString = (logger.info(`GET all WFH Request`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(httpStatus.OK).json({ success: result?.success, message: result?.message, data: result?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to get WFH Requests, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to Get WFH Requests', error })
    }
})

const wfhDept = catchAsync(async (req, res) => {
    try {
        const result = await wfhRequestService.wfhDept(req?.body)
        const logString = (logger.info(`GET all Data`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(httpStatus.OK).json({ success: result?.success, message: result?.message, data: result?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to get Data, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to Get Data', error })
    }
})

const getNumOfWfhDays = catchAsync(async (req, res) => {
    try {
        const result = await wfhRequestService.getNumOfWfhDays(req?.body)
        const logString = (logger.info(`GET WFH Days`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(httpStatus.OK).json({ success: result?.success, message: result?.message, data: result?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to get WFH Days, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to Get WFH Days', error })
    }
})

const getAllWfhRequestsOnUserId = catchAsync(async (req, res) => {
    try {
        const result = await wfhRequestService.getAllWfhRequestsOnUserId(req?.body)
        const logString = (logger.info(`GET WFH Requests`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(httpStatus.OK).json({ success: result?.success, message: result?.message, data: result?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to get WFH Requests, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to Get WFH Requests', error })
    }
})

const getAllWfhRequestsToday = catchAsync(async (req, res) => {
    try {
        const result = await wfhRequestService.getAllWfhRequestsToday(req?.body)
        const logString = (logger.info(`GET WFH Requests Today`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(httpStatus.OK).json({ success: result?.success, message: result?.message, data: result?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to get WFH Requests Today, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to Get WFH Requests Today', error })
    }
})

const getUserWfhRequests = catchAsync(async (req, res) => {
    try {
        const result = await wfhRequestService.getUserWfhRequests(req.params.userId, req.params.date)
        const logString = (logger.info(`GET WFH Requests of User`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(httpStatus.OK).json({ success: result?.success, message: result?.message, data: result?.data })
    } catch (error) {
        const logString = (logger.error(`Failed to get WFH Requests of User, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('wfh_request', req.userId, logString);
        res.status(400).json({ success: false, message: 'Failed to Get WFH Requests of User', error })
    }
})

module.exports = {
    createWfhRequest,
    withdrawWfhRequest,
    approveWfhRequest,
    rejectWfhRequest,
    reassignWfhRequest,
    getUserWfhCount,
    getAllWFHRequests,
    wfhDept,
    getNumOfWfhDays,
    getAllWfhRequestsOnUserId,
    getAllWfhRequestsToday,
    getUserWfhRequests
}
