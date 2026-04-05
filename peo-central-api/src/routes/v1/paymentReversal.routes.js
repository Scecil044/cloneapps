const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const { paymentReversalController } = require('../../controllers');
const { paymentReversalValidation } = require('../../validations');
const validate = require('../../middlewares/validate');

const router = express.Router();

router.route('/:paymentId/reverse')
  .all(verifyToken)
  .post(validate(paymentReversalValidation.reversePayment), paymentReversalController.reversePayment);

router.route('/:paymentId/reversal-history')
  .all(verifyToken)
  .get(paymentReversalController.getPaymentReversalHistory);

module.exports = router;
