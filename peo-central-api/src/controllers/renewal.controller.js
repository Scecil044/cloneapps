const httpStatus = require("http-status");
const { renewalService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");

const getRenewals = catchAsync(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const renewals = await renewalService.getRenewals(req.query.companyId, page, limit)
        if (!renewals) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Renewals on CompanyID');
        }
        const logString = (logger.info(`${req.userName} Accessed all the Renewals with CompanyID - ${req.params.companyId}`)).transports[0].logString;
        await loggerService.createLogger('renewals', req.userId, logString);
        res.status(httpStatus.OK).send(renewals)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Renewals with CompanyID - ${req.params.companyId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('Renewals', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch Renewals for the Provided CompanyID', details: error });
    }
});


module.exports = {
    getRenewals
}