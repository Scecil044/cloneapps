const httpStatus = require("http-status");
const { loggerService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")
const logger = require('../middlewares/logger');
const { Users } = require('../models');

const createLogger = catchAsync(async (req, res) => {
    try {
        const logs = await loggerService.createLogger(req.body)
        res.status(httpStatus.CREATED).send(logs);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create Logs. Please Check the Input', details: error });
    }
});

const updateLoggersOnId = catchAsync(async (req, res) => {
    try {
        const updatedLogs = await loggerService.updateLoggersOnId(req.params.loggerId, req.body, req.userId);
        if (!updatedLogs) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Logs');
        }
        res.status(httpStatus.OK).send(updatedLogs)
    } catch (error) {
        res.status(400).json({ message: 'Failed to Update Logs. Please Check the Input', details: error });
    }
});

const deleteLoggerOnId = catchAsync(async (req, res) => {
    try {
        const logs = await loggerService.deleteLoggerOnId(req.params.loggerId)
        if (!logs) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete logs');
        }
        res.status(httpStatus.OK).send(logs);
    } catch (error) {
        res.status(400).json({ message: 'Failed to Delete Logs for the Given ID', details: error });
    }
})

const getAllLoggers = catchAsync(async (req, res) => {
    try {
        const logs = await loggerService.getAllLoggers()
        if (!logs) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Logs');
        }
        res.status(httpStatus.OK).send(logs)
    } catch (error) {
        res.status(400).json({ message: 'Failed to Fetch All Logs', details: error });
    }
});

const getLoggerById = catchAsync(async (req, res) => {
    try {
        const logs = await loggerService.getLoggerById(req.params.loggerId)
        if (!logs) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Logs');
        }
        res.status(httpStatus.OK).send(logs)
    } catch (error) {
        res.status(400).json({ message: 'Failed to Fetch Logs for the Given ID', details: error });
    }
})

const getLoggersByModule = catchAsync(async (req, res) => {
    try {
        const logs = await loggerService.getLoggersByModule(req.params.module)
        if (!logs) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Logs');
        }
        res.status(httpStatus.OK).send(logs)
    } catch (error) {
        res.status(400).json({ message: 'Failed to Fetch Logs for the Given Module', details: error });
    }
})

const loggerByUserId = catchAsync(async (req, res) => {
    try {
        const logs = await loggerService.loggerByUserId(req.params.userId)
        if (!logs) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Logs');
        }
        res.status(httpStatus.OK).send(logs)
    } catch (error) {
        res.status(400).json({ message: 'Failed to Fetch Logs for the Given UserID', details: error });
    }
})

const filterAndSearchLogger = catchAsync(async (req, res) => {
    try {
        const logs = await loggerService.filterAndSearchLogger(req.query, req.body);
        if (!logs) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Logs');
        }
        res.status(httpStatus.OK).send(logs)
    } catch (error) {
        res.status(400).json({ message: 'Failed to Fetch Logs for the Given Filters', details: error });
    }
})

module.exports = {
    createLogger,
    updateLoggersOnId,
    deleteLoggerOnId,
    getAllLoggers,
    getLoggerById,
    getLoggersByModule,
    loggerByUserId,
    filterAndSearchLogger
}