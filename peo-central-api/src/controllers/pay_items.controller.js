const { payItemService } = require('../services');
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");

const createPayItems = catchAsync(async (req, res) => {
    try {
        const payitem = await payItemService.createPayItems(req.body)
        payitem.map(async (items) => {
            const createdBy = await payItemService.updateCreatedBy(items._id, req.userId);
            const logMessage = logPayItemCreation(req.userId, items);
            const addActivityLog = await activityService.createActivity(req.userId, items._id, "payitem", {}, items, {}, logMessage);
            const logString = (logger.info(`${req.userName} Created a payitem with ID ${items._id}`)).transports[0].logString;
            await loggerService.createLogger('payitem', req.userId, logString);
        });
        res.status(httpStatus.CREATED).send(payitem);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create payitem, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to create payitem. Please Check the Input', details: error });
    }
});

function logPayItemCreation(userId, payitem) {
    const logMsg = `User ${userId} Created payitem ${payitem._id}`;
    return logMsg
}

const updatePayItemsOnId = catchAsync(async (req, res) => {
    try {
        const existingPayItembyID = await payItemService.payItemsById(req.params.payItemId);
        const updatedPayItem = await payItemService.updatePayItemsOnId(req.params.payItemId, req.body, req.userId);
        const updatedBy = await payItemService.updateUpdatedBy(req.params.payItemId, req.userId);
        const updatedFields = diff(existingPayItembyID.toJSON(), updatedPayItem.toJSON());
        const logMessage = logPayItemUpdates(req.userId, existingPayItembyID, updatedPayItem, updatedFields);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.payItemId, "payitem", existingPayItembyID, updatedPayItem, updatedFields, logMessage);
        if (!updatedPayItem) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update payitem');
        }
        const logString = (logger.info(`${req.userName} Updated a payitem with ID ${req.params.payItemId}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(httpStatus.OK).send(updatedPayItem)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update payitem with ID ${req.params.payItemId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update payitem. Please Check the Input', details: error });
    }
});

function logPayItemUpdates(userId, oldDoc, updatedPayItem, updatedFields) {
    const logMsg = `User ${userId} updated payitem ${updatedPayItem._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedPayItem[field]}`);
    }
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const deletePayItemsOnId = catchAsync(async (req, res) => {
    try {
        const existingPayItembyID = await payItemService.payItemsById(req.params.payItemId);
        const payitem = await payItemService.deletePayItemsOnId(req.params.payItemId)
        const updatedBy = await payItemService.updateUpdatedBy(req.params.payItemId, req.userId);
        const logMessage = logPayItemDeletion(req.userId, payitem);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.payItemId, "payitem", existingPayItembyID, {}, {}, logMessage);
        if (!payitem) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete payitem');
        }
        const logString = (logger.info(`${req.userName} Deleted payitem with ID ${req.params.payItemId}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(httpStatus.OK).send(payitem);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete payitem with ID ${req.params.payItemId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete payitem for the Given ID', details: error });
    }
})

function logPayItemDeletion(userId, payitem) {
    const logMsg = `User ${userId} Deleted payitem ${payitem._id}`;
    return logMsg
}

const listAllPayItems = catchAsync(async (req, res) => {
    try {
        const payitem = await payItemService.listAllPayItems(req.query)
        if (!payitem) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all payitem');
        }
        const logString = (logger.info(`${req.userName} Accessed all the payitem`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(httpStatus.OK).send(payitem)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access all the payitem , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch All payitem', details: error });
    }
});

const payItemsById = catchAsync(async (req, res) => {
    try {
        const payitem = await payItemService.payItemsById(req.params.payItemId)
        if (!payitem) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch payitem');
        }
        const logString = (logger.info(`${req.userName} Accessed payitem with ID ${req.params.payItemId}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(httpStatus.OK).send(payitem)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access payitem with ID ${req.params.payItemId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch payitem for the Given ID', details: error });
    }
});

const payItemsOnCompanyId = catchAsync(async (req, res) => {
    try {
        const payitem = await payItemService.payItemsOnCompanyId(req.params.companyId, req.query)
        if (!payitem) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch payitem for the given companyID');
        }
        const logString = (logger.info(`${req.userName} Accessed payitem for the compnay ID ${req.params.companyId}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(httpStatus.OK).send(payitem)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access payitem for the company ID ${req.params.companyId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch payitem for the Given Company ID', details: error });
    }
});

const payItemsOnUserId = catchAsync(async (req, res) => {
    try {
        const payitem = await payItemService.payItemsOnUserId(req.params.userId, req.query)
        if (!payitem) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch payitem for the given userId');
        }
        const logString = (logger.info(`${req.userName} Accessed payitem for the user ID ${req.params.userId}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(httpStatus.OK).send(payitem)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access payitem for the user ID ${req.params.userId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch payitem for the Given user ID', details: error });
    }
});

const listOfAllPayItemsWithTheirCompanyNameAndUserNames = catchAsync(async (req, res) => {
    try {
        const payitem = await payItemService.listOfAllPayItemsWithTheirCompanyNameAndUserNames(req.query, req.body)
        if(!payitem) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the payitem Data');
        }
        const logString = (logger.info(`${req.userName} Accessed all the payitem Data on either searching, filtering or all`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(httpStatus.OK).send(payitem)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access payitem Data on either searching, filtering or all, encountered following error => ${error}`)).transports[0].logString
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch payitem Data on either searching, filtering or all', details: error });
    }
});

const getPayItemsAndInvoiceDataOnInvoiceID = catchAsync(async (req, res) => {
    try {
        const payitem = await payItemService.getPayItemsAndInvoiceDataOnInvoiceID(req.params.invoiceId)
        if(!payitem) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the payitem Data');
        }
        const logString = (logger.info(`${req.userName} Accessed all the payitems On Invoice ID`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(httpStatus.OK).send(payitem)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access payitems On Invoice ID, encountered following error => ${error}`)).transports[0].logString
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch payitems On Invoice ID', details: error });
    }
});

const listOfInvoicesInPayitems = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const invoiceList = await payItemService.listOfInvoicesInPayitems(req.query, req.body, page, limit)
        if(!invoiceList) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the List of Invoices')
        }
        const logString = (logger.info(`${req.userName} Access the List of Invoices for which the payitems were created`)).transports[0].logString;
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(httpStatus.OK).send(invoiceList)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to get the list of Invoices, encountered following error => ${error}`)).transports[0].logString
        await loggerService.createLogger('payitem', req.userId, logString);
        res.status(400).json({ message: 'Failed to get the list of invoices in the payitems', details: error});
    }
})

module.exports = {
    createPayItems,
    updatePayItemsOnId,
    deletePayItemsOnId,
    listAllPayItems,
    payItemsById,
    payItemsOnCompanyId,
    payItemsOnUserId,
    listOfAllPayItemsWithTheirCompanyNameAndUserNames,
    getPayItemsAndInvoiceDataOnInvoiceID,
    listOfInvoicesInPayitems
}