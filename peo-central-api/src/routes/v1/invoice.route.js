const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const { invoiceController } = require('../../controllers');
const { invoiceValidations } = require('../../validations');
const validate = require('../../middlewares/validate');

router.route('/manual/monthly/invoice/generation/:companyId').get(invoiceController.manualMonthlyInvoiceGeneration);

router.route('/create/general-invoice-report').get(invoiceController.exportGeneralInvoiceReport);
// hot fix
router.route('/create/monthly-invoice-report').get(invoiceController.monthlyInvoiceSummary);

router.route('/create/employees-salary-report').get(invoiceController.exportEmployeeSalariesReport);

router
  .route('/create/security/deposit/mobilization/charges/invoice')
  .post(invoiceController.generateSecurityDepositAndMobilizationInvoice);

router.route('/ageing/summary/report').get(invoiceController.exportAgeingSummaryReport);

router.route('/ageing/detailed/report').get(invoiceController.exportAgeingDetailedReport);

router.route('/create/general-invoice').all(verifyToken).post(invoiceController.createInvoice);

router.route('/journal-info/:id').all(verifyToken).post(invoiceController.getInfo);

router.route('/create/debit-note').all(verifyToken).post(invoiceController.createDebitNote);

router.route('/setup-preview').all(verifyToken).post(invoiceController.getOrCreatePreviewInvoice);

router.route('/getpreview').all(verifyToken).post(invoiceController.getPreview);

router.route('/getpreviewpdf').all(verifyToken).post(invoiceController.getPreviewPDF);

router.route('/create/payroll-invoice').all(verifyToken).post(invoiceController.createPayrollInvoice);

router.route('/update/:invoiceId').all(verifyToken).patch(invoiceController.updateInvoice);

router.route('/void/:invoiceId').all(verifyToken).patch(validate(invoiceValidations.markInvoiceAsVoid), invoiceController.markinvoiceAsVoid);

router.route('/record/payment').all(verifyToken).post(validate(invoiceValidations.recordPayment), invoiceController.recordPayment);

router.route('/update/payment/:paymentId').all(verifyToken).patch(validate(invoiceValidations.updatePayment), invoiceController.updatePayment);

router
  .route('/record/multiple/payments')
  .all(verifyToken)
  .post(validate(invoiceValidations.recordMultipleInvoicePayments), invoiceController.recordMultipleInvoicePayment);

router.route('/update/debit/note/:debitNoteId').all(verifyToken).patch(invoiceController.updateDebitNoteId);

router.route('/update/payroll/invoice/:payrollInvoiceId').all(verifyToken).patch(invoiceController.updatePayrollInvoiceOnId);

router.route('/revert/invoice/:generalInvoiceId').all(verifyToken).post(invoiceController.revertGeneralInvoice);

router.route('/cancel/general/invoice/:generalInvoiceId').all(verifyToken).post(invoiceController.cancelGeneralInvoice);

router.route('/charofaccounts/customer').all(verifyToken).post(invoiceController.getChartOfAccountByCustID);

router.route('/counts').all(verifyToken).post(invoiceController.getCountsOfInvoices);

router.route('/list').all(verifyToken).post(invoiceController.invoicesAllFilterSearch);

router.route('/void/invoices').all(verifyToken).post(invoiceController.listVoidInvoices);

router.route('/users/:invoiceId').all(verifyToken).post(invoiceController.getUsersOfSelectedInvoice);

router.route('/status/list').all(verifyToken).post(invoiceController.listOfInvoiceStatus);

router.route('/').all(verifyToken).post(invoiceController.getAllInvoices);

router.route('/id/:invoiceId').all(verifyToken).post(invoiceController.getInvoiceOnInvoiceID);

router.route('/type/').all(verifyToken).post(invoiceController.getAllPayrollInvoice);

router.route('/schedule').all(verifyToken).post(invoiceController.paymentScheduleData);

router.route('/schedule/status').all(verifyToken).post(invoiceController.paymentScheduleStatus);

router.route('/userid/:userId').all(verifyToken).post(invoiceController.getInvoicesOfUsers);

router.route('/currency/list').all(verifyToken).get(invoiceController.currencyList);

router.route('/statusChecker/:id').all(verifyToken).post(invoiceController.InvoiceChecker);

router.route('/create/monthly/invoice').all(verifyToken).post(invoiceController.createmonthlyInvoice);

router.route('/create/monthly/invoice/direct').all(verifyToken).post(invoiceController.createMonthlyInvoiceDirect);

router.route('/amount/due/companies').post(invoiceController.getAmountsDueForCompanies);

router
  .route('/trigget/invoice/expiry/notifications')
  .all(verifyToken)
  .post(invoiceController.triggerExpiredInvoicesNotification);

router.route('/duplicate/:invoiceId').all(verifyToken).post(invoiceController.duplicateInvoice);

router.route('/export/template').all(verifyToken).get(invoiceController.exportInvoiceTemplate);

router.route('/bulk/upload').all(verifyToken).post(invoiceController.bulkUploadInvoices);

module.exports = router;
