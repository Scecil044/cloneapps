const httpStatus = require("http-status");
const { insightService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/logger');
const { loggerService } = require("../services");
const { toLower } = require("lodash");
const { ObjectId } = require("mongodb");

const leadsCounts = catchAsync(async (req, res) => {
    try {
        const result = await insightService.leadsCounts()
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the Data');
        }
        const logString = (logger.info(`${req.userName} Accessed the Leads Counts in the Insights`)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Data Leads Counts in Insights, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Data Leads Counts ', details: error });
    }
})

const leadsCountsOnClientType = catchAsync(async (req, res) => {
    try {
        const result = await insightService.leadsCountsOnClientType()
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the Data');
        }
        const logString = (logger.info(`${req.userName} Accessed the Leads counts on the Client Type`)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Data, number of Leads on Client Type, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Data, number of Leads on the Client Type ', details: error });
    }
})

const leadsPipelineCounts = catchAsync(async (req, res) => {
    try {
        const result = await insightService.leadsPipelineCounts()
        if (!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the Data');
        }
        const logString = (logger.info(`${req.userName} Accessed the Leads counts on Pipeline Status`)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the Data, number of Leads on Pipeline Status, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Data, number of Leads on Pipeline Status ', details: error });
    }
})

const onboardingsCount = catchAsync(async (req, res) => {
    try {
        const result = await insightService.onboardingsCount()
        if(!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the Data');
        }
        const logString = (logger.info(`${req.userName} Accessed Onboardings Counts `)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch(error) {
        const logString = (logger.error(`${req.userName} Failed to get the Data, Onboardings Counts, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Data, Onboardings Counts ', details: error });
    }
})

const onboardingPipelineCounts = catchAsync(async (req, res) => {
    try {
        const result = await insightService.onboardingPipelineCounts()
        if(!result) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the Data');
        }
        const logString = (logger.info(`${req.userName} Accessed Onboardings Pipeline Counts `)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch(error) {
        const logString = (logger.error(`${req.userName} Failed to get the Data, Onboardings pipeline Counts, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('insights', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the Data, Onboardings Pipeline Counts ', details: error });
    }
})

module.exports = {
    leadsCounts,
    leadsCountsOnClientType,
    leadsPipelineCounts,
    onboardingsCount,
    onboardingPipelineCounts
}