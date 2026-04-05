const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { invoiceLogsController } = require('../../controllers');

router
    .route("/create").all(verifyToken)
    .post(invoiceLogsController.createInvoiceLog)

router
    .route("/").all(verifyToken)
    .get(invoiceLogsController.listAllInvoiceLogs)

router
    .route("/invoicelogid/:invoicelogId").all(verifyToken)
    .get(invoiceLogsController.invoiceLogByID)

router
    .route("/:invoicelogId").all(verifyToken)
    .patch(invoiceLogsController.updateInvoiceLogOnId)
    .delete(invoiceLogsController.deleteInvoiceLogOnId)

router
    .route("/document/:documentId").all(verifyToken)
    .get(invoiceLogsController.getInvoiceLogsByDocumentId)

module.exports = router;
