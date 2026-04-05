const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const logger = require('../middlewares/logger');
const { SmsNotifications , Users , loggerService } = require("../services");


const createSms = catchAsync(async (req, res) => {
    try {
        const smsCreate = await SmsNotifications.createSms(req.body)
        res.status(httpStatus.CREATED).send(smsCreate);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create Sms, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('SMS Notification', req.userId, logString);
        res.status(400).json({ message: 'Failed to create SMS. Please Check the Input', details: error });
    }
});


const UpdateSms = catchAsync(async (req, res) => {
    try {
        const update = await SmsNotifications.updateSms(req.body)
        res.status(httpStatus.CREATED).send(update);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update Sms, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('SMS Notification', req.userId, logString);
        res.status(400).json({ message: 'Failed to update SMS. Please Check the Input', details: error });
    }
});


const DeleteSms = catchAsync(async (req, res) => {
    try {
        const deleteSms = await SmsNotifications.deleteSms(req.params.id)
        res.status(httpStatus.CREATED).send(deleteSms);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update Sms, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('SMS Notification', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete SMS. Please Check the Input', details: error });
    }
});


const getAllSms = catchAsync(async (req, res) => {
    try {
        const AllSms = await SmsNotifications.getAllSms()
        res.status(httpStatus.CREATED).send(AllSms);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get All Sms, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('SMS Notification', req.userId, logString);
        res.status(400).json({ message: 'Failed to get All SMS. Please Check the Input', details: error });
    }
});


const getSmsDetails = catchAsync(async (req, res) => {
    try {
        const AllSms = await SmsNotifications.getSmsById(req.params.id)
        res.status(httpStatus.CREATED).send(AllSms);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get All Sms, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('SMS Notification', req.userId, logString);
        res.status(400).json({ message: 'Failed to get All SMS. Please Check the Input', details: error });
    }
});


module.exports = {
    createSms, 
    UpdateSms, 
    DeleteSms, 
    getAllSms, 
    getSmsDetails
}