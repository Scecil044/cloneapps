const verifyToken = require("../../middlewares/verifyToken");
const express = require("express");
const { paymentsController } = require("../../controllers");
const router = express.Router();

router.route("/invoice/:invoiceId").all(verifyToken).get(paymentsController.getPaymentByInvoiceId);

module.exports = router;