const httpStatus = require("http-status");
const { stageService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");

const createStages = catchAsync(async (req, res) => {
    try {
        const stage = await stageService.createStages(req.body)
        const createdBy = await stageService.updateCreatedBy(stage._id, req.userId);
        const logMessage = logStageCreation(req.userId, stage);
        const addActivityLog = await activityService.createActivity(req.userId, stage._id, "stages", {}, stage, {}, logMessage);
        const logString = (logger.info(`${req.userName} Created a stage with ID ${stage._id}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(httpStatus.CREATED).send(stage);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create stage, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(400).json({ message: 'Failed to create stage. Please Check the Input', details: error });
    }
});

function logStageCreation(userId, stage) {
    const logMsg = `User ${userId} Created stage ${stage._id}`;
    return logMsg
}

const updateStagesOnId = catchAsync(async (req, res) => {
    try {
        const existingStagebyID = await stageService.stagesById(req.params.stageId);
        const updatedStage = await stageService.updateStagesOnId(req.params.stageId, req.body, req.userId);
        const updatedBy = await stageService.updateUpdatedBy(req.params.stageId, req.userId);
        const updatedFields = diff(existingStagebyID.toJSON(), updatedStage.toJSON());
        const logMessage = logStageUpdates(req.userId, existingStagebyID, updatedStage, updatedFields);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.stageId, "stages", existingStagebyID, updatedStage, updatedFields, logMessage);
        if (!updatedStage) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Stage');
        }
        const logString = (logger.info(`${req.userName} Updated a Stage with stageId ${req.params.stageId}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(httpStatus.OK).send(updatedStage)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update Stage with stageId ${req.params.stageId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Stage. Please Check the Input', details: error });
    }
});

function logStageUpdates(userId, oldDoc, updatedStage, updatedFields) {
    const logMsg = `User ${userId} updated Stage ${updatedStage._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedStage[field]}`);
    }
    // console.log(`${logMsg}\n${fieldUpdates.join('\n')}`);
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const listAllStages = catchAsync(async (req, res) => {
    try {
        const stages = await stageService.listAllStages()
        if (!stages) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all stages');
        }
        const logString = (logger.info(`${req.userName} Accessed all the stages`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(httpStatus.OK).send(stages)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access all the stages , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch All stages', details: error });
    }
});

const stagesById = catchAsync(async (req, res) => {
    try {
        const stages = await stageService.stagesById(req.params.stageId)
        if (!stages) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch stages');
        }
        const logString = (logger.info(`${req.userName} Accessed stages with stageId ${req.params.stageId}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(httpStatus.OK).send(stages)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access stages with stageId ${req.params.stageId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch stages for the Given ID', details: error });
    }
})

const deleteStagesOnId = catchAsync(async (req, res) => {
    try {
        const existingStagebyID = await stageService.stagesById(req.params.stageId);
        const stages = await stageService.deleteStagesOnId(req.params.stageId)
        const updatedBy = await stageService.updateUpdatedBy(req.params.stageId, req.userId);
        const logMessage = logStageDeletion(req.userId, stages);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.stageId, "stages", existingStagebyID, {}, {}, logMessage);
        if (!stages) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete stages');
        }
        const logString = (logger.info(`${req.userName} Deleted stages with stageId ${req.params.stageId}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(httpStatus.OK).send(stages);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete stages with stageId ${req.params.stageId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete stages for the Given ID', details: error });
    }
})

function logStageDeletion(userId, stages) {
    const logMsg = `User ${userId} Deleted stages ${stages._id}`;
    return logMsg
}

const listVisaProcessStages = catchAsync(async (req, res) => {
    try {
        const stages = await stageService.listVisaProcessStages(req.body)
        if (!stages) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch stages');
        }
        const logString = (logger.info(`${req.userName} Accessed Visa Process stages`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(httpStatus.OK).send(stages)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Visa Process , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Visa Process Stages', details: error });
    }
})

const listVisaProcessStagesOnSectionName = catchAsync(async (req, res) => {
    try {
        const stages = await stageService.listVisaProcessStagesOnSectionName(req.params.sectionName, req.body)
        if (!stages) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch stages');
        }
        const logString = (logger.info(`${req.userName} Accessed Visa Process stages on Section Name`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(httpStatus.OK).send(stages)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Visa Process on Section Name, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('stages', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Visa Process Stages', details: error?.message });
    }
})

module.exports = {
    createStages,
    updateStagesOnId,
    listAllStages,
    stagesById,
    deleteStagesOnId,
    listVisaProcessStages,
    listVisaProcessStagesOnSectionName
}