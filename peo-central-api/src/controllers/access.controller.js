const httpStatus = require("http-status");
const { accessService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");

const createAccess = catchAsync(async (req, res) => {
    try {
        const access = await accessService.createAccess(req.body)
        const createdBy = await accessService.updateCreatedBy(access._id, req.userId);
        const logMessage = logAccessCreation(req.userId, access);
        const addActivityLog = await activityService.createActivity(req.userId, access._id, "access", {}, access, {}, logMessage);
        const logString = (logger.info(`${req.userName} Created an Access with ID ${access._id}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(httpStatus.CREATED).send(access);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create Access, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(400).json({ message: 'Failed to create Access. Please Check the Input', details: error });
    }
});

function logAccessCreation(userId, access) {
    const logMsg = `User ${userId} Created Access ${access._id}`;
    return logMsg
}

const updateAccess = catchAsync(async (req, res) => {
    try {
        const existingAccessbyID = await accessService.listofAccessById(req.params.accessId);
        const updatedAccess = await accessService.updateAccess(req.params.accessId, req.body, req.userId);
        const updatedBy = await accessService.updateUpdatedBy(req.params.accessId, req.userId);
        const updatedFields = diff(existingAccessbyID.toJSON(), updatedAccess.toJSON());
        const logMessage = logAccessUpdates(req.userId, existingAccessbyID, updatedAccess, updatedFields);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.accessId, "access", existingAccessbyID, updatedAccess, updatedFields, logMessage);
        if (!updatedAccess) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update access');
        }
        const logString = (logger.info(`${req.userName} Updated a Access with AccessID ${req.params.accessId}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(httpStatus.OK).send(updatedAccess)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update Access with AccessID ${req.params.accessId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Access. Please Check the Input', details: error });
    }
});

function logAccessUpdates(userId, oldDoc, updatedAccess, updatedFields) {
    const logMsg = `User ${userId} updated Access ${updatedAccess._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedAccess[field]}`);
    }
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const listAllAccess = catchAsync(async (req, res) => {
    try {
        const access = await accessService.listAllAccess()
        if (!access) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all access');
        }
        const logString = (logger.info(`${req.userName} Accessed all the Access`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(httpStatus.OK).send(access)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access all the Access , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch All Access', details: error });
    }
});

const listofAccessById = catchAsync(async (req, res) => {
    try {
        const access = await accessService.listofAccessById(req.params.accessId)
        if (!access) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch access');
        }
        const logString = (logger.info(`${req.userName} Accessed Access with AccessID ${req.params.accessId}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(httpStatus.OK).send(access)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Access with AccessID ${req.params.accessId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Access for the Given ID', details: error });
    }
})

const listofAccessByModule = catchAsync(async (req, res) => {
    try {
        const access = await accessService.listofAccessByModule(req.params.module)
        if (!access) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch access');
        }
        const logString = (logger.info(`${req.userName} Accessed Access with Module ${req.params.module}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(httpStatus.OK).send(access)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Access with Module ${req.params.module} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Access for the Given Module', details: error });
    }
})

const deleteAccess = catchAsync(async (req, res) => {
    try {
        const existingAccessbyID = await accessService.listofAccessById(req.params.accessId);
        const access = await accessService.deleteAccess(req.params.accessId)
        const updatedBy = await accessService.updateUpdatedBy(req.params.accessId, req.userId);
        const logMessage = logAccessDeletion(req.userId, access);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.accessId, "access", existingAccessbyID, {}, {}, logMessage);
        if (!access) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete access');
        }
        const logString = (logger.info(`${req.userName} Deleted Access with AccessID ${req.params.accessId}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(httpStatus.OK).send(access);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete Access with AccessID ${req.params.accessId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('access', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete Access for the Given ID', details: error });
    }
})

function logAccessDeletion(userId, access) {
    const logMsg = `User ${userId} Deleted Access ${access._id}`;
    return logMsg
}

module.exports = {
    createAccess,
    updateAccess,
    listAllAccess,
    listofAccessById,
    listofAccessByModule,
    deleteAccess
}