const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { payItemsController } = require("../../controllers");
const PayrollprocessesModel = require('../../models/payrollprocess.model')


router
    .route("/").all(verifyToken)
    .post(payItemsController.createPayItems)
    .get(payItemsController.listAllPayItems)

router
    .route("/:payItemId").all(verifyToken)
    .get(payItemsController.payItemsById)
    .patch(payItemsController.updatePayItemsOnId)
    .delete(payItemsController.deletePayItemsOnId)

router
    .route("/company/id/:companyId").all(verifyToken)
    .post(payItemsController.payItemsOnCompanyId)

router
    .route("/user/id/:userId").all(verifyToken)
    .post(payItemsController.payItemsOnUserId)

router
    .route("/search/filter/all").all(verifyToken)
    .post(payItemsController.listOfAllPayItemsWithTheirCompanyNameAndUserNames)

router
    .route("/invoice/:invoiceId").all(verifyToken)
    .post(payItemsController.getPayItemsAndInvoiceDataOnInvoiceID)

router
    .route("/list/invoices").all(verifyToken)
    .post(payItemsController.listOfInvoicesInPayitems)



module.exports = router