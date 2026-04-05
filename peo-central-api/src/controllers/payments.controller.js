const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {  paymentsService, loggerService } = require('../services');
const logger = require('../middlewares/logger');


const getPaymentByInvoiceId = catchAsync(async (req, res) => {
    try {
        const response = await paymentsService.getPaymentByInvoiceId(req.params.invoiceId);
        const logString = logger.info(`${req.userName} Accessed all the payments count route`).transports[0].logString;
        await loggerService.createLogger('payments', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} Failed to Access payments count => ${error}`)
            .transports[0].logString;
        await loggerService.createLogger('payments', req.userId, logString);
        res.status(400).json({ message: 'Failed to get payments', details: error?.message });
    }
});

module.exports = {
    getPaymentByInvoiceId
}