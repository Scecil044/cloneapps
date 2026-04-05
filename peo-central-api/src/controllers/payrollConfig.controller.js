const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const logger = require('../middlewares/loggers');
const pick = require('../utils/pick');
const { payrollConfigService, activityService, loggerService } = require("../services")

const createpayrollConfiguration = catchAsync(async (req, res) => {
    try {
        const config = await payrollConfigService.createpayrollConfiguration(req.body)
        const logMessage = logConfigCreation(req.userId, config);
        const addActivityLog = await activityService.createActivity(req.userId, config._id, "config", {}, config, {}, logMessage);
        const logString = (logger.info(`${req.userName} Created a config with ID ${config._id}`)).transports[0].logString;
        await loggerService.createLogger('configs', req.userId, logString);
        res.status(200).json({ success: true, message: "Success", data })
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create config, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('configs', req.userId, logString);
        console.log(error, "ERROR")
        res.status(200).json({ success: false, message: 'Failed to create config. Please Check the Input', details: error.message, data: [] })
    }
});

function logConfigCreation(userId, config) {
    const logMsg = `User ${userId} Created stage ${config._id}`;
    return logMsg
}

const getPayrollbyCompanyID = catchAsync(async (req, res) => {
    const { company_ID } = req.params
    try {
        const data = await payrollConfigService.getPayrollbyCompanyID(company_ID)
        if (!data) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch payroll Configuration');
        }
        const logString = (logger.info(`${req.userName} Accessed payroll Configuration`)).transports[0].logString;
        await loggerService.createLogger('data', req.userId, logString);
        res.status(200).json({ success: true, message: "Success", data })
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access payroll Configuration , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('data', req.userId, logString);
        console.log(error, "ERROR")
        res.status(200).json({ success: false, message: 'Failed to Fetch payroll Configuration', data: [] })
    }
})

const listallPayloadConfig = catchAsync(async (req, res) => {
    try {
        const data = await payrollConfigService.listallPayloadConfig()
        if (!data) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch payroll Configuration');
        }

        res.status(200).json({ success: true, message: "Success", data })
    } catch (error) {

        console.log(error, "ERROR")
        res.status(200).json({ success: false, message: 'Failed to Fetch payroll Configuration', data: [] })
    }
})

const updatepayrollConfigOnCompanyId = catchAsync(async (req, res) => {
    try {
        const updatedConfig = await payrollConfigService.updatepayrollConfigOnCompanyId(req.params.company_ID, req.body);
        if (!updatedConfig) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update payroll config');
        }
        const logString = (logger.info(`${req.userName} Updated a payroll config with company_ID ${req.params.company_ID}`)).transports[0].logString;
        await loggerService.createLogger('payroll config', req.userId, logString);
        res.status(200).json({ success: true, message: "Success", data: updatedConfig })
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update payroll Config with company_ID ${req.params.company_ID}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payroll config', req.userId, logString);
        res.status(200).json({ success: false, message: 'Failed to Update payroll config. Please Check the Input', data: [] })
    }
});

function logConfigUpdates(userId, oldDoc, updatedConfig, updatedFields) {
    const logMsg = `User ${userId} updated Stage ${updatedConfig._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedConfig[field]}`);
    }
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const getPayrollConfig = catchAsync(async (req, res) => {
    try {
        const options = pick(req.query, ['limit', 'page']);
        const data = await payrollConfigService.getPayrollConfig(req.body, options)
        if (!data) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch payroll Configuration');
        }
        const logString = (logger.info(`${req.userName} Accessed payroll Configuration`)).transports[0].logString;
        await loggerService.createLogger('data', req.userId, logString);
        res.status(200).json({ success: true, message: "Success", data })
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access payroll Configuration , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('data', req.userId, logString);
        console.log(error, "ERROR")
        res.status(200).json({ success: false, message: 'Failed to Fetch payroll Configuration', data: [] })
    }
});


const deletepayrollConfig = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;

        const data = await payrollConfigService.deletepayrollConfig(id)
        const logString = (logger.info(`${req.userName} Deleted payroll Configuration`)).transports[0].logString;
        await loggerService.createLogger('data', req.userId, logString);
        res.status(200).json({ success: true, message: "Successfully deleted payroll", data })
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to delete payroll Configuration , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('data', req.userId, logString);
        console.log(error, "ERROR")
        res.status(200).json({ success: false, message: 'Failed to delete payroll Configuration', data: [] })
    }
});


module.exports = {
    createpayrollConfiguration,
    updatepayrollConfigOnCompanyId,
    getPayrollConfig,
    getPayrollbyCompanyID,
    listallPayloadConfig,
    deletepayrollConfig,
}