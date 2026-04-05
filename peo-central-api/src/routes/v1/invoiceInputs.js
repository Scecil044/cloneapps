const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const invoiceInputsValidation = require('../../validations/invoiceInputs.validation');
const invoiceInputsController = require('../../controllers/invoiceInputs.controller');

const router = express.Router();

// Email approval routes (no authentication required for email links)
// IMPORTANT: These must come BEFORE parameterized routes to avoid conflicts
router
  .route('/approve-email/:token')
  .get(invoiceInputsController.approveInvoiceInputViaEmail);

router
  .route('/reject-email/:token')
  .get(invoiceInputsController.rejectInvoiceInputViaEmail);

router
  .route('/').all(verifyToken)
  .post(
    validate(invoiceInputsValidation.createInvoiceInput),
    invoiceInputsController.createInvoiceInput
  )
  .get(
    validate(invoiceInputsValidation.getInvoiceInputs),
    invoiceInputsController.getInvoiceInputs
  );

router
  .route('/:invoiceInputId').all(verifyToken)
  .get(
    validate(invoiceInputsValidation.getInvoiceInput),
    invoiceInputsController.getInvoiceInput
  )
  .patch(
    validate(invoiceInputsValidation.updateInvoiceInput),
    invoiceInputsController.updateInvoiceInput
  )
  .delete(
    validate(invoiceInputsValidation.deleteInvoiceInput),
    invoiceInputsController.deleteInvoiceInput
  );

router
  .route('/company/:companyId').all(verifyToken)
  .get(
    validate(invoiceInputsValidation.getInvoiceInputsByCompany),
    invoiceInputsController.getInvoiceInputsByCompany
  );

router
  .route('/company/:companyId/stats').all(verifyToken)
  .get(
    validate(invoiceInputsValidation.getInvoiceInputsStats),
    invoiceInputsController.getInvoiceInputsStats
  );

router
  .route('/:invoiceInputId/status').all(verifyToken)
  .patch(
    validate(invoiceInputsValidation.updateInvoiceStatus),
    invoiceInputsController.updateInvoiceStatus
  );

router
  .route('/:invoiceInputId/items/:itemId/receipts').all(verifyToken)
  .post(
    validate(invoiceInputsValidation.addReceipt),
    invoiceInputsController.addReceipt
  );

router
  .route('/:invoiceInputId/items/:itemId/receipts/:receiptId').all(verifyToken)
  .delete(
    validate(invoiceInputsValidation.removeReceipt),
    invoiceInputsController.removeReceipt
  );

module.exports = router;
