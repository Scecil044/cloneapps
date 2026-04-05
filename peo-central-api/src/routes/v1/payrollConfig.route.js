const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { payrollConfigController } = require("../../controllers");

router
    .route("/").all(verifyToken)
    .post(payrollConfigController.createpayrollConfiguration)
    .get(payrollConfigController.listallPayloadConfig)

router
    .route('/:company_ID').all(verifyToken)
    .get(payrollConfigController.getPayrollbyCompanyID)

router
    .route('/update/:company_ID').all(verifyToken)
    .patch(payrollConfigController.updatepayrollConfigOnCompanyId)

router 
    .route('/:id').all(verifyToken)
    .delete(payrollConfigController.deletepayrollConfig)

router
    .route('/getPayrollConfig')
    .post(payrollConfigController.getPayrollConfig)

module.exports = router