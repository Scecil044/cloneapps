const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/loggers');
const { loggerService, payrollManagementService } = require("../services");

// WPS Payouts Controllers
const getAllWpsPayouts = catchAsync(async (req, res) => {
    const options = { 
        limit: parseInt(req.query.limit) || 10, 
        page: parseInt(req.query.page) || 1,
        sortBy: req.query.sortBy || 'createdAt:desc'
    };
    const data = await payrollManagementService.getAllWpsPayouts(req.query, options);
    const logString = (logger.info(`${req.userName} Fetched all WPS payouts`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "WPS payouts fetched successfully" });
});

const createWpsPayout = catchAsync(async (req, res) => {
    const data = await payrollManagementService.createWpsPayout(req.body, req.userId);
    const logString = (logger.info(`${req.userName} Created new WPS payout`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.CREATED).send({ success: true, data, message: "WPS payout created successfully" });
});

const getWpsPayoutById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await payrollManagementService.getWpsPayoutById(id);
    const logString = (logger.info(`${req.userName} Fetched WPS payout with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "WPS payout fetched successfully" });
});

const updateWpsPayout = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await payrollManagementService.updateWpsPayout(id, req.body, req.userId);
    const logString = (logger.info(`${req.userName} Updated WPS payout with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "WPS payout updated successfully" });
});

const deleteWpsPayout = catchAsync(async (req, res) => {
    const { id } = req.params;
    await payrollManagementService.deleteWpsPayout(id, req.userId);
    const logString = (logger.info(`${req.userName} Deleted WPS payout with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, message: "WPS payout deleted successfully" });
});

const getWpsPayoutsByCompany = catchAsync(async (req, res) => {
    const { companyId } = req.params;
    const options = { 
        limit: parseInt(req.query.limit) || 10, 
        page: parseInt(req.query.page) || 1 
    };
    const data = await payrollManagementService.getWpsPayoutsByCompany(companyId, options);
    const logString = (logger.info(`${req.userName} Fetched WPS payouts for company: ${companyId}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "WPS payouts fetched successfully" });
});

const 

















































batchProcessWpsPayouts = catchAsync(async (req, res) => {
    const data = await payrollManagementService.batchProcessWpsPayouts(req.body, req.userId);
    const logString = (logger.info(`${req.userName} Processed batch WPS payouts`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Batch WPS payouts processed successfully" });
});

// Commissions Payouts Controllers
const getAllCommissionsPayouts = catchAsync(async (req, res) => {
    const options = { 
        limit: parseInt(req.query.limit) || 10, 
        page: parseInt(req.query.page) || 1,
        sortBy: req.query.sortBy || 'createdAt:desc'
    };
    const data = await payrollManagementService.getAllCommissionsPayouts(req.query, options);
    const logString = (logger.info(`${req.userName} Fetched all commissions payouts`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Commissions payouts fetched successfully" });
});

const createCommissionsPayout = catchAsync(async (req, res) => {
    const data = await payrollManagementService.createCommissionsPayout(req.body, req.userId);
    const logString = (logger.info(`${req.userName} Created new commissions payout`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.CREATED).send({ success: true, data, message: "Commissions payout created successfully" });
});

const getCommissionsPayoutById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await payrollManagementService.getCommissionsPayoutById(id);
    const logString = (logger.info(`${req.userName} Fetched commissions payout with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Commissions payout fetched successfully" });
});

const updateCommissionsPayout = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await payrollManagementService.updateCommissionsPayout(id, req.body, req.userId);
    const logString = (logger.info(`${req.userName} Updated commissions payout with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Commissions payout updated successfully" });
});

const deleteCommissionsPayout = catchAsync(async (req, res) => {
    const { id } = req.params;
    await payrollManagementService.deleteCommissionsPayout(id, req.userId);
    const logString = (logger.info(`${req.userName} Deleted commissions payout with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, message: "Commissions payout deleted successfully" });
});

const getCommissionsPayoutsByCompany = catchAsync(async (req, res) => {
    const { companyId } = req.params;
    const options = { 
        limit: parseInt(req.query.limit) || 10, 
        page: parseInt(req.query.page) || 1 
    };
    const data = await payrollManagementService.getCommissionsPayoutsByCompany(companyId, options);
    const logString = (logger.info(`${req.userName} Fetched commissions payouts for company: ${companyId}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Commissions payouts fetched successfully" });
});

const getCommissionsPayoutsByEmployee = catchAsync(async (req, res) => {
    const { employeeId } = req.params;
    const options = { 
        limit: parseInt(req.query.limit) || 10, 
        page: parseInt(req.query.page) || 1 
    };
    const data = await payrollManagementService.getCommissionsPayoutsByEmployee(employeeId, options);
    const logString = (logger.info(`${req.userName} Fetched commissions payouts for employee: ${employeeId}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Commissions payouts fetched successfully" });
});

const calculateCommissions = catchAsync(async (req, res) => {
    const data = await payrollManagementService.calculateCommissions(req.body);
    const logString = (logger.info(`${req.userName} Calculated commissions`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Commissions calculated successfully" });
});

// Service Refunds Controllers
const getAllServiceRefunds = catchAsync(async (req, res) => {
    const options = { 
        limit: parseInt(req.query.limit) || 10, 
        page: parseInt(req.query.page) || 1,
        sortBy: req.query.sortBy || 'createdAt:desc'
    };
    const data = await payrollManagementService.getAllServiceRefunds(req.query, options);
    const logString = (logger.info(`${req.userName} Fetched all service refunds`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Service refunds fetched successfully" });
});

const createServiceRefund = catchAsync(async (req, res) => {
    const data = await payrollManagementService.createServiceRefund(req.body, req.userId);
    const logString = (logger.info(`${req.userName} Created new service refund`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.CREATED).send({ success: true, data, message: "Service refund created successfully" });
});

const getServiceRefundById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await payrollManagementService.getServiceRefundById(id);
    const logString = (logger.info(`${req.userName} Fetched service refund with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Service refund fetched successfully" });
});

const updateServiceRefund = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await payrollManagementService.updateServiceRefund(id, req.body, req.userId);
    const logString = (logger.info(`${req.userName} Updated service refund with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Service refund updated successfully" });
});

const deleteServiceRefund = catchAsync(async (req, res) => {
    const { id } = req.params;
    await payrollManagementService.deleteServiceRefund(id, req.userId);
    const logString = (logger.info(`${req.userName} Deleted service refund with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, message: "Service refund deleted successfully" });
});

const getServiceRefundsByCompany = catchAsync(async (req, res) => {
    const { companyId } = req.params;
    const options = { 
        limit: parseInt(req.query.limit) || 10, 
        page: parseInt(req.query.page) || 1 
    };
    const data = await payrollManagementService.getServiceRefundsByCompany(companyId, options);
    const logString = (logger.info(`${req.userName} Fetched service refunds for company: ${companyId}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Service refunds fetched successfully" });
});

const approveServiceRefund = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await payrollManagementService.approveServiceRefund(id, req.body, req.userId);
    const logString = (logger.info(`${req.userName} Approved service refund with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Service refund approved successfully" });
});

const rejectServiceRefund = catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = await payrollManagementService.rejectServiceRefund(id, req.body, req.userId);
    const logString = (logger.info(`${req.userName} Rejected service refund with ID: ${id}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Service refund rejected successfully" });
});

// Reports and Analytics Controllers
const getPayrollSummary = catchAsync(async (req, res) => {
    const data = await payrollManagementService.getPayrollSummary(req.query);
    const logString = (logger.info(`${req.userName} Fetched payroll summary`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Payroll summary fetched successfully" });
});

const getMonthlyPayrollReport = catchAsync(async (req, res) => {
    const { month, year } = req.params;
    const data = await payrollManagementService.getMonthlyPayrollReport(month, year, req.query);
    const logString = (logger.info(`${req.userName} Fetched monthly payroll report for ${month}/${year}`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Monthly payroll report fetched successfully" });
});

const getPayrollDashboard = catchAsync(async (req, res) => {
    const data = await payrollManagementService.getPayrollDashboard(req.query);
    const logString = (logger.info(`${req.userName} Fetched payroll dashboard`)).transports[0].logString;
    await loggerService.createLogger('payroll_management', req.userId, logString);
    res.status(httpStatus.OK).send({ success: true, data, message: "Payroll dashboard data fetched successfully" });
});

module.exports = {
    // WPS Payouts
    getAllWpsPayouts,
    createWpsPayout,
    getWpsPayoutById,
    updateWpsPayout,
    deleteWpsPayout,
    getWpsPayoutsByCompany,
    batchProcessWpsPayouts,
    
    // Commissions Payouts
    getAllCommissionsPayouts,
    createCommissionsPayout,
    getCommissionsPayoutById,
    updateCommissionsPayout,
    deleteCommissionsPayout,
    getCommissionsPayoutsByCompany,
    getCommissionsPayoutsByEmployee,
    calculateCommissions,
    
    // Service Refunds
    getAllServiceRefunds,
    createServiceRefund,
    getServiceRefundById,
    updateServiceRefund,
    deleteServiceRefund,
    getServiceRefundsByCompany,
    approveServiceRefund,
    rejectServiceRefund,
    
    // Reports and Analytics
    getPayrollSummary,
    getMonthlyPayrollReport,
    getPayrollDashboard
};