const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const{logRequestBody, getUserId} = require('../utils/reqUtils')
const { diff } = require('deep-object-diff');
const logger = require('../middlewares/loggers');
const pick = require('../utils/pick');
const { activityService, loggerService, letterConfigService } = require("../services")

const createLetterConfiguration = catchAsync(async (req, res) => {
    try {
        const config = await letterConfigService.createLetterConfiguration(req.body)
        const logMessage = logletterConfigCreation(getUserId(req), config);
        const addActivityLog = await activityService.createActivity(getUserId(req), config._id, "config", {}, config, {}, logMessage);
        const logString = (logger.info(`${getUserId(req)} Created a config with ID ${config._id} and with data ${logRequestBody(req)}`)).transports[0].logString;
        await loggerService.createLogger('configs', getUserId(req), logString);
        res.status(200).json({ success: true, message: "Success", config })
        } catch (error) {
        const logString = (logger.error(`${getUserId(req)} Failed to Create config, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('configs', getUserId(req), logString);
        console.log(error,"ERROR")
        res.status(200).json({ success: false, message: 'Failed to create config. Please Check the Input', details: error.message, data:[] })
    }
});

function logletterConfigCreation(userId, config) {
    const logMsg = `User ${userId} Created stage ${config._id}`;
    return logMsg
}

const updateLetterConfigOnCompanyId = catchAsync(async (req, res) => {
    try {
        //const existingConfigbyID = await letterConfigService.letterConfigById(req.params.company_ID);
        const updatedConfig = await letterConfigService.updateLetterConfigOnCompanyId(req.params.company_ID, req.body);
        /*const updatedFields = diff(existingConfigbyID.toJSON(), updatedConfig.toJSON());
        const logMessage = logLetterConfigUpdates(getUserId(req), existingConfigbyID, updatedConfig, updatedFields);
        const addActivityLog = await activityService.createActivity(getUserId(req), req.params.company_ID, "letter Config", existingConfigbyID, updatedConfig, updatedFields, logMessage);*/
        if (!updatedConfig) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update letter config');
        }
        const logString = (logger.info(`${getUserId(req)} Updated a letter config with company_ID ${req.params.company_ID}`)).transports[0].logString;
        await loggerService.createLogger('letter config', getUserId(req), logString);
        res.status(200).json({ success: true, message: updatedConfig.message, data: updatedConfig.data })
    } catch (error) {
        console.log(error)
        const logString = (logger.error(`${getUserId(req)} Failed to Update letter Config with company_ID ${req.params.company_ID}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('letter config', getUserId(req), logString);
        res.status(200).json({ success: false, message: 'Failed to Update letter config. Please Check the Input', data:[] })
    }
});

function logLetterConfigUpdates(userId, oldDoc, updatedConfig, updatedFields) {
    const logMsg = `User ${userId} updated Stage ${updatedConfig._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedConfig[field]}`);
    }
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const listLetterConfigbyCompanyID = catchAsync(async (req, res) => {
    try {
        const response = await letterConfigService.listLetterConfigbyCompanyID(req.body)
        if (!response.data || Object.keys(response.data).length === 0){
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch letter Configuration');
        }
        const logString = (logger.info(`${getUserId(req)} Accessed letter Configuration`)).transports[0].logString;
        await loggerService.createLogger('data', getUserId(req), logString);
        res.status(200).json({ success: true, message: response.message, data: response.data })
    } catch (error) {
        const logString = (logger.error(`${getUserId(req)} Failed to Access letter Configuration , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('data', getUserId(req), logString);
        res.status(200).json({ success: false, message: 'Failed to Fetch letter Configuration', data:[] })
    }
});

const listrequestTypeforCompany_ID = catchAsync(async (req, res) => {
    try {
        const options = pick(req.query, ['limit', 'page']);
        const data = await letterConfigService.listrequestTypeforCompany_ID(req.body , options)
        if (!data) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch letter Configuration');
        }
        const logString = (logger.info(`${getUserId(req)} Accessed letter Configuration`)).transports[0].logString;
        await loggerService.createLogger('data', getUserId(req), logString);
        res.status(200).json({ success: true, message: "Success", data })
    } catch (error) {
        const logString = (logger.error(`${getUserId(req)} Failed to Access letter Configuration , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('data', getUserId(req), logString);
        console.log(error,"ERROR")
        res.status(200).json({ success: false, message: 'Failed to Fetch letter Configuration', data:[] })
    }
});

const listRequestContent = catchAsync(async (req, res) => {
    try {
        const options = pick(req.query, ['limit', 'page']);
        const data = await letterConfigService.listRequestContent(req.body , options)
        if (!data) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch letter Configuration');
        }
        const logString = (logger.info(`${getUserId(req)} Accessed letter Configuration`)).transports[0].logString;
        await loggerService.createLogger('data', getUserId(req), logString);
        res.status(200).json({ success: true, message: "Success", data })
    } catch (error) {
        const logString = (logger.error(`${getUserId(req)} Failed to Access letter Configuration , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('data', getUserId(req), logString);
        console.log(error,"ERROR")
        res.status(200).json({ success: false, message: 'Failed to Fetch letter Configuration', data:[] })
    }
});

const getLetterRequestTypesAndLetterKeys = catchAsync(async (req, res) => {
    try {
        const { data } = await letterConfigService.getLetterRequestTypesAndLetterKeys(req?.body)
        const extractedData = data.letterRequest.map(entry => {
            const { letterKeys = [], letterDescription = {} } = entry
            const { requestType = "", requestSubType = "" } = letterDescription
            return { letterKeys, requestType, requestSubType }
        });
        res.status(200).json({ success: true, message: "Success", extractedData })
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to Fetch letter Configuration', data: [] })
    }
});

module.exports = {
    createLetterConfiguration,
    updateLetterConfigOnCompanyId,
    listLetterConfigbyCompanyID,
    listRequestContent,
    listrequestTypeforCompany_ID,
    getLetterRequestTypesAndLetterKeys
}