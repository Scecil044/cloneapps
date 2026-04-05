const express = require('express');
const router = express.Router();
const { payrollManagementController } = require('../../controllers');
const verifyToken = require('../../middlewares/verifyToken');

// WPS Payouts routes
router
  .route('/wps-payouts')
  .all(verifyToken)
  .get(payrollManagementController.getAllWpsPayouts)
  .post(payrollManagementController.createWpsPayout);

router
  .route('/wps-payouts/:id')
  .all(verifyToken)
  .get(payrollManagementController.getWpsPayoutById)
  .put(payrollManagementController.updateWpsPayout)
  .delete(payrollManagementController.deleteWpsPayout);

router
  .route('/wps-payouts/company/:companyId')
  .all(verifyToken)
  .get(payrollManagementController.getWpsPayoutsByCompany);

router
  .route('/wps-payouts/batch-process')
  .all(verifyToken)
  .post(payrollManagementController.batchProcessWpsPayouts);

// Commissions Payouts routes
router
  .route('/commissions-payouts')
  .all(verifyToken)
  .get(payrollManagementController.getAllCommissionsPayouts)
  .post(payrollManagementController.createCommissionsPayout);

router
  .route('/commissions-payouts/:id')
  .all(verifyToken)
  .get(payrollManagementController.getCommissionsPayoutById)
  .put(payrollManagementController.updateCommissionsPayout)
  .delete(payrollManagementController.deleteCommissionsPayout);

router
  .route('/commissions-payouts/company/:companyId')
  .all(verifyToken)
  .get(payrollManagementController.getCommissionsPayoutsByCompany);

router
  .route('/commissions-payouts/employee/:employeeId')
  .all(verifyToken)
  .get(payrollManagementController.getCommissionsPayoutsByEmployee);

router
  .route('/commissions-payouts/calculate')
  .all(verifyToken)
  .post(payrollManagementController.calculateCommissions);

// Service Refunds routes
router
  .route('/service-refunds')
  .all(verifyToken)
  .get(payrollManagementController.getAllServiceRefunds)
  .post(payrollManagementController.createServiceRefund);

router
  .route('/service-refunds/:id')
  .all(verifyToken)
  .get(payrollManagementController.getServiceRefundById)
  .put(payrollManagementController.updateServiceRefund)
  .delete(payrollManagementController.deleteServiceRefund);

router
  .route('/service-refunds/company/:companyId')
  .all(verifyToken)
  .get(payrollManagementController.getServiceRefundsByCompany);

router
  .route('/service-refunds/approve/:id')
  .all(verifyToken)
  .put(payrollManagementController.approveServiceRefund);

router
  .route('/service-refunds/reject/:id')
  .all(verifyToken)
  .put(payrollManagementController.rejectServiceRefund);

// Combined reports and analytics
router
  .route('/reports/summary')
  .all(verifyToken)
  .get(payrollManagementController.getPayrollSummary);

router
  .route('/reports/monthly/:month/:year')
  .all(verifyToken)
  .get(payrollManagementController.getMonthlyPayrollReport);

router
  .route('/analytics/dashboard')
  .all(verifyToken)
  .get(payrollManagementController.getPayrollDashboard);

module.exports = router;