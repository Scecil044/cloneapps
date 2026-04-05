const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const {dashboardService, loggerService} = require('../services');
const catchAsync = require('../utils/catchAsync');
const logger = require('../middlewares/logger');

const recentOnboardings = catchAsync(async (req, res) => {
    try {
        const response = await dashboardService.recentOnboardings(req.body);
        const logString = logger.info(`${req.userName} accessed recent onboardings for dashboard`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to access recent onboardings: ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(400).json({ message: 'Failed to get recent onboardings', details: error?.message });
    }
});

const getClientStats = catchAsync(async (req, res) => {
    try {
        const response = await dashboardService.getClientStats(req.body);
        const logString = logger.info(`${req.userName} accessed client stats for dashboard`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to access client stats: ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(400).json({ message: 'Failed to get client stats', details: error?.message });
    }
});

const fetchClientTasks = catchAsync(async (req, res) => {
    try {
        const response = await dashboardService.fetchClientTasks(req.body, req.query);
        const logString = logger.info(`${req.userName} accessed client tasks for dashboard`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to access client tasks: ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(400).json({ message: 'Failed to get client tasks', details: error?.message });
    }
});

const statsCard = async(req, res)=>{
    try{
        const response = await dashboardService.statsCard(req.body);
        const logString = logger.info(`${req.userName} accessed stats card for dashboard`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = logger.error(`${req.userName} failed to access stats card: ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(400).json({ message: 'Failed to get stats card', details: error?.message });
    }
}

const recentRenewals = catchAsync(async (req, res) => {
    try {
        const response = await dashboardService.recentRenewals(req.body);
        const logString = logger.info(`${req.userName} accessed recent renewals for dashboard`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to access recent renewals: ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(400).json({ message: 'Failed to get recent renewals', details: error?.message });
    }
});

const recentOffboardings = catchAsync(async (req, res) => {
    try {
        const response = await dashboardService.recentOffboardings(req.body);
        const logString = logger.info(`${req.userName} accessed recent offboardings for dashboard`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to access recent offboardings: ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(400).json({ message: 'Failed to get recent offboardings', details: error?.message });
    }
});

const fetchRecentVisaProcesses = catchAsync(async (req, res) => {
    try {
        const response = await dashboardService.fetchRecentVisaProcesses(req.body);
        const logString = logger.info(`${req.userName} accessed recent visa processes for dashboard`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to access recent visa processes: ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(400).json({ message: 'Failed to get recent visa processes', details: error?.message });
    }
});

const recentTickets = catchAsync(async (req, res) => {
    try {
        const response = await dashboardService.recentTickets(req.body);
        const logString = logger.info(`${req.userName} accessed recent tickets for dashboard`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to access recent tickets: ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(400).json({ message: 'Failed to get recent tickets', details: error?.message });
    }
});

const ticketCounts = catchAsync(async (req, res) => {
    try {
        const response = await dashboardService.ticketCounts(req.body);
        const logString = logger.info(`${req.userName} accessed ticket counts for dashboard`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    } catch (error) {
        const logString = logger.error(`${req.userName} failed to access ticket counts: ${error?.message}`).transports[0].logString;
        await loggerService.createLogger('dashboard', req.userId, logString);
        res.status(400).json({ message: 'Failed to get ticket counts', details: error?.message });
    }
});

module.exports = {
    recentOnboardings,
    recentRenewals,
    recentOffboardings,
    fetchRecentVisaProcesses,
    recentTickets,
    ticketCounts,
    statsCard,
    getClientStats,
    fetchClientTasks
};