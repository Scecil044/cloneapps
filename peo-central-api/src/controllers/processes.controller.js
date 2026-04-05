const httpStatus = require("http-status");
const { processesService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");

const createProcesses = catchAsync(async (req, res) => {
    try {
        const processes = await processesService.createProcesses(req.body)
        const createdBy = await processesService.updateCreatedBy(processes._id, req.userId);
        const logMessage = logProcessesCreation(req.userId, processes);
        const addActivityLog = await activityService.createActivity(req.userId, processes._id, "processes", {}, processes, {}, logMessage);
        const logString = (logger.info(`${req.userName} Created a processes with ID ${processes._id}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(httpStatus.CREATED).send(processes);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create processes, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(400).json({ message: 'Failed to create processes. Please Check the Input', details: error });
    }
});

function logProcessesCreation(userId, processes) {
    const logMsg = `User ${userId} Created processes ${processes._id}`;
    return logMsg
}

const updateProcessOnId = catchAsync(async (req, res) => {
    try {
        const existingProcessbyID = await processesService.processById(req.params.processId);
        const updatedProcess = await processesService.updateProcessOnId(req.params.processId, req.body, req.userId);
        const updatedBy = await processesService.updateUpdatedBy(req.params.processId, req.userId);
        const updatedFields = diff(existingProcessbyID.toJSON(), updatedProcess.toJSON());
        const logMessage = logProcessesUpdates(req.userId, existingProcessbyID, updatedProcess, updatedFields);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.processId, "processes", existingProcessbyID, updatedProcess, updatedFields, logMessage);
        if (!updatedProcess) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update processes');
        }
        const logString = (logger.info(`${req.userName} Updated a processes with processId ${req.params.processId}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(httpStatus.OK).send(updatedProcess)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update processes with processId ${req.params.processId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update processes. Please Check the Input', details: error });
    }
});

function logProcessesUpdates(userId, oldDoc, updatedProcess, updatedFields) {
    const logMsg = `User ${userId} updated processes ${updatedProcess._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedProcess[field]}`);
    }
    // console.log(`${logMsg}\n${fieldUpdates.join('\n')}`);
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const deleteProcessOnId = catchAsync(async (req, res) => {
    try {
        const existingProcessbyID = await processesService.processById(req.params.processId);
        const processes = await processesService.deleteProcessOnId(req.params.processId)
        const updatedBy = await processesService.updateUpdatedBy(req.params.processId, req.userId);
        const logMessage = logProcessDeletion(req.userId, processes);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.processId, "processes", existingProcessbyID, {}, {}, logMessage);
        if (!processes) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete processes');
        }
        const logString = (logger.info(`${req.userName} Deleted processes with processId ${req.params.processId}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(httpStatus.OK).send(processes);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete processes with processId ${req.params.processId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete processes for the Given ID', details: error });
    }
})

function logProcessDeletion(userId, processes) {
    const logMsg = `User ${userId} Deleted processes ${processes._id}`;
    return logMsg
}

const listAllProcesses = catchAsync(async (req, res) => {
    try {
        const processes = await processesService.listAllProcesses()
        if (!processes) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all processes');
        }
        const logString = (logger.info(`${req.userName} Accessed all the processes`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(httpStatus.OK).send(processes)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access all the processes , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch All processes', details: error });
    }
});

const getProcessOnModuleName = catchAsync(async (req, res) => {
    try {
        const processes = await processesService.getProcessOnModuleName(req.params.moduleName)
        if (!processes) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch processes');
        }
        const logString = (logger.info(`${req.userName} Accessed Process for the given module ${req.params.moduleName}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(httpStatus.OK).send(processes)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Process for the given module ${req.params.moduleName} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch processes for the Given ID', details: error });
    }
})

const processById = catchAsync(async (req, res) => {
    try {
        const processes = await processesService.processById(req.params.processId)
        if (!processes) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch processes');
        }
        const logString = (logger.info(`${req.userName} Accessed processes with processId ${req.params.processId}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(httpStatus.OK).send(processes)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access processes with processId ${req.params.processId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('processes', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch processes for the Given ID', details: error });
    }
})

module.exports = {
    createProcesses,
    listAllProcesses,
    getProcessOnModuleName,
    updateProcessOnId,
    deleteProcessOnId,
    processById
}