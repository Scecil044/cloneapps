const httpStatus = require("http-status");
const { activityService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");

const createActivity = catchAsync(async (req, res) => {
    try {
        const activity = await activityService.createActivity(req.body.user_id, req.body.document_id, req.body.module, req.body.oldDoc, req.body.newDoc, req.body.updatedFields, req.body.logMessage)
        const logString = (logger.info(`Activity Log Created for the module ${req.body.module} with ID being ${activity._id}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(httpStatus.CREATED).send(activity);
    } catch (error) {
        const logString = (logger.error(`Failed to Create Activity Log for the module ${req.body.module}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(400).json({ message: 'Failed to create Activity. Please Check the Input', details: error });
    }
});

const updateActivityOnId = catchAsync(async (req, res) => {
    try {
        const activity = await activityService.updateActivityOnId(req.params.activityId, req.body)
        if (!activity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Activity');
        }
        const logString = (logger.info(`${req.userName} Updated an Activity Log with ID ${req.params.activityId}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(httpStatus.OK).send(activity)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update an Activity Log with ID ${req.params.activityId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Activity. Please Check the Input', details: error });
    }
});

const listAllActivities = catchAsync(async (req, res) => {
    try {
        const activity = await activityService.listAllActivities()
        if (!activity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Activities');
        }
        const logString = (logger.info(`${req.userName} Accessed All the Activity Logs`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(httpStatus.OK).send(activity)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access All the Activity Logs, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch All Activities', details: error });
    }
});

const activityById = catchAsync(async (req, res) => {
    try {
        const activity = await activityService.activityById(req.params.activityId)
        if (!activity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Activities');
        }
        const logString = (logger.info(`${req.userName} Accessed Activity Log for the following ActivityID - ${req.params.activityId}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(httpStatus.OK).send(activity)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access All the Activity Logs for the ID ${req.params.activityId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Activities for the Given ID', details: error });
    }
});

const activityByUserId = catchAsync(async (req, res) => {
    try {
        const activity = await activityService.activityByUserId(req.params.userId)
        if (!activity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Activities');
        }
        const logString = (logger.info(`${req.userName} Accessed Activity Log for the following User ID - ${req.params.userId}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(httpStatus.OK).send(activity)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access All the Activity Logs for the User ID ${req.params.userId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Activities for the Given UserID', details: error });
    }
});

const activityByDocId = catchAsync(async (req, res) => {
    try {
        const activity = await activityService.activityByDocId(req.params.documentId)
        if (!activity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Activities');
        }
        const logString = (logger.info(`${req.userName} Accessed Activity Log for the following Document ID - ${req.params.documentId}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(httpStatus.OK).send(activity)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access All the Activity Logs for the Document ID ${req.params.documentId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Activities for the Given DocumentID', details: error });
    }
});

const activityOnModuleName = catchAsync(async (req, res) => {
    try {
        const activity = await activityService.activityOnModuleName(req.params.module)
        if (!activity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Activities');
        }
        const logString = (logger.info(`${req.userName} Accessed Activity Log for the following Module Name - ${req.params.module}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(httpStatus.OK).send(activity)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access All the Activity Logs for the Module Name ${req.params.module}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Activities for the Given Module', details: error });
    }
});

const deleteActivity = catchAsync(async (req, res) => {
    try {
        const activity = await activityService.deleteActivity(req.params.activityId)
        if (!activity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete Activity');
        }
        const logString = (logger.info(`${req.userName} Deleted Activity Log with ID - ${req.params.activityId}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(httpStatus.OK).send(activity);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete the Activity Log with ID ${req.params.activityId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('activities', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete Activity for the Given ID', details: error });
    }
});

module.exports = {
    createActivity,
    updateActivityOnId,
    listAllActivities,
    activityById,
    activityByUserId,
    deleteActivity,
    activityByDocId,
    activityOnModuleName
}