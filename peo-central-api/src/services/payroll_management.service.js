const { ObjectId } = require("mongodb");
const httpStatus = require("http-status");
const ApiError = require('../utils/ApiError');
const moment = require("moment");
const { Users, Companies } = require("../models");
const PayrollManagement = require("../models/payroll_management.js");
const PayrollCommission = require("../models/payroll_commission.model.js");

// WPS Payouts Service Functions
const getAllWpsPayouts = async (filters = {}, options = {}) => {
    try {
        const query = buildWpsQuery(filters);
        
        if (Object.keys(options).length === 0) {
            // Return all without pagination
            return await PayrollManagement.find(query).populate('user_id', 'first_name last_name email').lean();
        }
        
        // Return paginated results
        return await PayrollManagement.paginate(query, {
            ...options,
            populate: [
                { path: 'user_id', select: 'first_name last_name email' }
            ]
        });
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching WPS payouts: ${error.message}`);
    }
};

const createWpsPayout = async (payoutData, userId) => {
    try {
        // Validate required fields
        if (!payoutData.user_id || !payoutData.pay_month) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'User ID and pay month are required');
        }

        // Create WPS payout record
        const newPayout = new PayrollManagement({
            ...payoutData,
            status: payoutData.status || 'pending',
            payout_status: payoutData.payout_status || 'pending',
            payroll_initiated_date: new Date(),
            process: [{
                process_name: 'WPS Payout Created',
                created_at: new Date(),
                completed_by: { userId },
                status: 'pending'
            }]
        });

        return await newPayout.save();
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error creating WPS payout: ${error.message}`);
    }
};

const getWpsPayoutById = async (id) => {
    try {
        if (!ObjectId.isValid(id)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payout ID');
        }

        const payout = await PayrollManagement.findById(id)
            .populate('user_id', 'first_name last_name email company_id')
            .populate('invoice_id')
            .lean();
        
        if (!payout) {
            throw new ApiError(httpStatus.NOT_FOUND, 'WPS payout not found');
        }
        
        return payout;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching WPS payout: ${error.message}`);
    }
};

const updateWpsPayout = async (id, updateData, userId) => {
    try {
        if (!ObjectId.isValid(id)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payout ID');
        }

        // Add process entry for update
        const processEntry = {
            process_name: 'WPS Payout Updated',
            created_at: new Date(),
            completed_by: { userId },
            status: 'Completed'
        };

        const updatedPayout = await PayrollManagement.findByIdAndUpdate(
            id, 
            { 
                ...updateData,
                $push: { process: processEntry }
            }, 
            { new: true }
        ).populate('user_id', 'first_name last_name email');
        
        if (!updatedPayout) {
            throw new ApiError(httpStatus.NOT_FOUND, 'WPS payout not found');
        }
        
        return updatedPayout;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error updating WPS payout: ${error.message}`);
    }
};

const deleteWpsPayout = async (id, userId) => {
    try {
        if (!ObjectId.isValid(id)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payout ID');
        }

        // Soft delete using the deletion plugin
        const deletedPayout = await PayrollManagement.delete({ _id: id }, userId);
        
        if (!deletedPayout) {
            throw new ApiError(httpStatus.NOT_FOUND, 'WPS payout not found');
        }
        
        return { message: 'WPS payout deleted successfully' };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error deleting WPS payout: ${error.message}`);
    }
};

const getWpsPayoutsByCompany = async (companyId, options = {}) => {
    try {
        if (!ObjectId.isValid(companyId)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid company ID');
        }

        const query = { companyId: ObjectId(companyId), isDeleted: { $ne: true } };
        
        // TODO: Replace with actual model query
        return {
            results: [],  // TODO: Replace with WpsPayouts.paginate(query, options);
            totalPages: 0,
            page: options.page,
            limit: options.limit,
            totalResults: 0
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching company WPS payouts: ${error.message}`);
    }
};

const batchProcessWpsPayouts = async (batchData, userId) => {
    try {
        const { payoutIds, action } = batchData;
        
        if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Payout IDs array is required');
        }

        const results = [];
        
        for (const payoutId of payoutIds) {
            try {
                // TODO: Process each payout based on action (approve, reject, process)
                const result = await processWpsPayout(payoutId, action, userId);
                results.push({ payoutId, status: 'success', result });
            } catch (error) {
                results.push({ payoutId, status: 'error', error: error.message });
            }
        }
        
        return {
            totalProcessed: payoutIds.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'error').length,
            results
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error processing batch WPS payouts: ${error.message}`);
    }
};

// Commissions Payouts Service Functions
const getAllCommissionsPayouts = async (filters = {}, options = {}) => {
    try {
        const query = buildCommissionsQuery(filters);
        
        if (Object.keys(options).length === 0) {
            // Return all without pagination
            return await PayrollCommission.find(query).populate('user_id', 'first_name last_name email').lean();
        }
        
        // Return paginated results
        return await PayrollCommission.paginate(query, {
            ...options,
            populate: [
                { path: 'user_id', select: 'first_name last_name email company_id' },
                { path: 'invoice_id' }
            ]
        });
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching commissions payouts: ${error.message}`);
    }
};

const createCommissionsPayout = async (payoutData, userId) => {
    try {
        // Validate required fields
        if (!payoutData.user_id || !payoutData.pay_month) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'User ID and pay month are required');
        }

        // Create commissions payout record
        const newPayout = new PayrollCommission({
            ...payoutData,
            status: payoutData.status || 'pending',
            payout_status: payoutData.payout_status || 'pending',
            payroll_initiated_date: new Date(),
            initiate_status: payoutData.initiate_status || 'pending',
            process: [{
                process_name: 'Commission Payout Created',
                created_at: new Date(),
                completed_by: { userId },
                status: 'pending'
            }]
        });

        return await newPayout.save();
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error creating commissions payout: ${error.message}`);
    }
};

const getCommissionsPayoutById = async (id) => {
    try {
        if (!ObjectId.isValid(id)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payout ID');
        }

        const payout = await PayrollCommission.findById(id)
            .populate('user_id', 'first_name last_name email company_id')
            .populate('invoice_id')
            .populate('invoice_transaction_id')
            .lean();
        
        if (!payout) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Commissions payout not found');
        }
        
        return payout;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching commissions payout: ${error.message}`);
    }
};

const updateCommissionsPayout = async (id, updateData, userId) => {
    try {
        if (!ObjectId.isValid(id)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid commission payout ID');
        }
        
        const updatedCommission = await PayrollCommission.findByIdAndUpdate(
            id,
            { 
                ...updateData,
                updated_at: new Date(),
                updated_by: userId 
            },
            { 
                new: true,
                runValidators: true 
            }
        ).populate('user_id', 'name email');
        
        if (!updatedCommission) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Commission payout not found');
        }
        
        logger.info('Commission payout updated successfully', { id, userId });
        return updatedCommission;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error updating commissions payout: ${error.message}`);
    }
};

const deleteCommissionsPayout = async (id, userId) => {
    try {
        if (!ObjectId.isValid(id)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid commission payout ID');
        }
        
        const commission = await PayrollCommission.findById(id);
        if (!commission) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Commission payout not found');
        }
        
        // Soft delete
        const deletedCommission = await PayrollCommission.findByIdAndUpdate(
            id,
            { 
                deleted: true,
                deleted_at: new Date(),
                deleted_by: userId 
            },
            { new: true }
        );
        
        logger.info('Commission payout deleted successfully', { id, userId });
        return { message: 'Commission payout deleted successfully', id };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error deleting commissions payout: ${error.message}`);
    }
};

const getCommissionsPayoutsByCompany = async (companyId, options = {}) => {
    try {
        if (!ObjectId.isValid(companyId)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid company ID');
        }
        
        const filter = { 
            company_id: ObjectId(companyId),
            deleted: { $ne: true }
        };
        
        const commissions = await PayrollCommission.paginate(
            filter,
            {
                ...options,
                populate: [
                    { path: 'user_id', select: 'name email' },
                    { path: 'company_id', select: 'name' }
                ],
                sort: { created_at: -1 }
            }
        );
        
        logger.info('Company commissions payouts fetched successfully', { companyId, count: commissions.results.length });
        return commissions;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching company commissions payouts: ${error.message}`);
    }
};

const getCommissionsPayoutsByEmployee = async (employeeId, options = {}) => {
    try {
        if (!ObjectId.isValid(employeeId)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid employee ID');
        }
        
        const filter = { 
            user_id: ObjectId(employeeId),
            deleted: { $ne: true }
        };
        
        const commissions = await PayrollCommission.paginate(
            filter,
            {
                ...options,
                populate: [
                    { path: 'user_id', select: 'name email' },
                    { path: 'company_id', select: 'name' }
                ],
                sort: { created_at: -1 }
            }
        );
        
        logger.info('Employee commissions payouts fetched successfully', { employeeId, count: commissions.results.length });
        return commissions;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching employee commissions payouts: ${error.message}`);
    }
};

const calculateCommissions = async (calculationData) => {
    try {
        // TODO: Implement commissions calculation logic
        const { employeeId, salesData, commissionRates } = calculationData;
        
        // Placeholder calculation
        const totalCommission = 0;
        
        return {
            employeeId,
            calculationDate: new Date(),
            totalCommission,
            breakdown: []
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error calculating commissions: ${error.message}`);
    }
};

// Service Refunds Service Functions
const getAllServiceRefunds = async (filters = {}, options = {}) => {
    try {
        // TODO: Implement service refunds logic
        return {
            results: [],
            totalPages: 0,
            page: options.page || 1,
            limit: options.limit || 10,
            totalResults: 0
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching service refunds: ${error.message}`);
    }
};

const createServiceRefund = async (refundData, userId) => {
    try {
        // TODO: Implement service refund creation
        return { ...refundData, createdBy: userId, createdAt: new Date(), status: 'pending' };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error creating service refund: ${error.message}`);
    }
};

const getServiceRefundById = async (id) => {
    try {
        // TODO: Implement get service refund by ID
        return null;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching service refund: ${error.message}`);
    }
};

const updateServiceRefund = async (id, updateData, userId) => {
    try {
        // TODO: Implement service refund update
        return null;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error updating service refund: ${error.message}`);
    }
};

const deleteServiceRefund = async (id, userId) => {
    try {
        // TODO: Implement service refund delete
        return { message: 'Service refund deleted successfully' };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error deleting service refund: ${error.message}`);
    }
};

const getServiceRefundsByCompany = async (companyId, options = {}) => {
    try {
        // TODO: Implement get service refunds by company
        return { results: [], totalPages: 0, page: options.page || 1, limit: options.limit || 10, totalResults: 0 };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error fetching company service refunds: ${error.message}`);
    }
};

const approveServiceRefund = async (id, approvalData, userId) => {
    try {
        // TODO: Implement service refund approval
        return { message: 'Service refund approved successfully' };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error approving service refund: ${error.message}`);
    }
};

const rejectServiceRefund = async (id, rejectionData, userId) => {
    try {
        // TODO: Implement service refund rejection
        return { message: 'Service refund rejected successfully' };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error rejecting service refund: ${error.message}`);
    }
};

// Reports and Analytics Service Functions
const getPayrollSummary = async (filters = {}) => {
    try {
        // TODO: Implement payroll summary
        const { startDate, endDate, companyId } = filters;
        
        return {
            totalWpsPayouts: 0,
            totalCommissions: 0,
            totalRefunds: 0,
            netPayroll: 0,
            period: { startDate, endDate }
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error generating payroll summary: ${error.message}`);
    }
};

const getMonthlyPayrollReport = async (month, year, filters = {}) => {
    try {
        // TODO: Implement monthly payroll report
        return {
            month,
            year,
            wpsPayouts: [],
            commissions: [],
            refunds: [],
            totals: {
                wps: 0,
                commissions: 0,
                refunds: 0,
                net: 0
            }
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error generating monthly payroll report: ${error.message}`);
    }
};

const getPayrollDashboard = async (filters = {}) => {
    try {
        // TODO: Implement payroll dashboard
        return {
            overview: {
                totalPayouts: 0,
                pendingApprovals: 0,
                processedToday: 0,
                totalRefunds: 0
            },
            charts: {
                monthlyTrends: [],
                payoutsByType: [],
                topCompanies: []
            },
            recentActivity: []
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error generating payroll dashboard: ${error.message}`);
    }
};

// Helper functions
const buildWpsQuery = (filters) => {
    const query = { deleted: { $ne: true } };
    
    if (filters.user_id) {
        query.user_id = ObjectId(filters.user_id);
    }
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    if (filters.payout_status) {
        query.payout_status = filters.payout_status;
    }
    
    if (filters.pay_month) {
        query.pay_month = filters.pay_month;
    }
    
    if (filters.startDate && filters.endDate) {
        query.created_at = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
        };
    }
    
    return query;
};

const buildCommissionsQuery = (filters) => {
    const query = { deleted: { $ne: true } };
    
    if (filters.user_id) {
        query.user_id = ObjectId(filters.user_id);
    }
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    if (filters.payout_status) {
        query.payout_status = filters.payout_status;
    }
    
    if (filters.pay_month) {
        query.pay_month = filters.pay_month;
    }
    
    if (filters.currency) {
        query.currency = filters.currency;
    }
    
    if (filters.payout_method) {
        query.payout_method = filters.payout_method;
    }
    
    if (filters.startDate && filters.endDate) {
        query.created_at = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
        };
    }
    
    return query;
};

const processWpsPayout = async (payoutId, action, userId) => {
    if (!ObjectId.isValid(payoutId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payout ID');
    }
    
    const payout = await PayrollManagement.findById(payoutId);
    if (!payout) {
        throw new ApiError(httpStatus.NOT_FOUND, 'WPS payout not found');
    }
    
    let updateData = {
        updated_at: new Date(),
        updated_by: userId
    };
    
    switch (action) {
        case 'approve':
            updateData.status = 'approved';
            updateData.approved_by = userId;
            updateData.approved_at = new Date();
            break;
        case 'reject':
            updateData.status = 'rejected';
            updateData.rejected_by = userId;
            updateData.rejected_at = new Date();
            break;
        case 'process':
            updateData.payout_status = 'processed';
            updateData.processed_by = userId;
            updateData.processed_at = new Date();
            break;
        default:
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid action. Must be approve, reject, or process');
    }
    
    const updatedPayout = await PayrollManagement.findByIdAndUpdate(
        payoutId,
        updateData,
        { new: true, runValidators: true }
    );
    
    logger.info('WPS payout processed successfully', { payoutId, action, userId });
    return updatedPayout;
};

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