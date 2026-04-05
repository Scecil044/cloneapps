const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { paymentProofsValidation } = require('../../validations');
const { paymentProofsController } = require('../../controllers');

// Base routes
router
  .route('/')
  .all(verifyToken)
  .post(validate(paymentProofsValidation.createPaymentProof), paymentProofsController.createPaymentProof)
  .get(validate(paymentProofsValidation.getAllPaymentProofs), paymentProofsController.getAllPaymentProofs);

// Routes with ID parameter
router
  .route('/:paymentProofId')
  .all(verifyToken)
  .get(validate(paymentProofsValidation.getPaymentProof), paymentProofsController.getPaymentProofById)
  .patch(validate(paymentProofsValidation.updatePaymentProof), paymentProofsController.updatePaymentProof)
  .delete(validate(paymentProofsValidation.deletePaymentProof), paymentProofsController.deletePaymentProof);

// Routes for specific invoice
router
  .route('/invoice/:invoiceId')
  .all(verifyToken)
  .get(validate(paymentProofsValidation.getPaymentProofsByInvoice), paymentProofsController.getPaymentProofsByInvoice);

// Routes for specific customer
router
  .route('/customer/:customerId')
  .all(verifyToken)
  .get(validate(paymentProofsValidation.getPaymentProofsByCustomer), paymentProofsController.getPaymentProofsByCustomer);

// Routes for specific status
router
  .route('/status/:status')
  .all(verifyToken)
  .get(validate(paymentProofsValidation.getPaymentProofsByStatus), paymentProofsController.getPaymentProofsByStatus);

// Route for reviewing payment proof
router
  .route('/:paymentProofId/review')
  .all(verifyToken)
  .patch(validate(paymentProofsValidation.reviewPaymentProof), paymentProofsController.reviewPaymentProof);

// Route for statistics
router
  .route('/stats/summary')
  .all(verifyToken)
  .get(validate(paymentProofsValidation.getPaymentProofStats), paymentProofsController.getPaymentProofStats);

module.exports = router;
