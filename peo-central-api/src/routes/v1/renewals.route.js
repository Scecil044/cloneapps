const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { renewalsProcessController } = require("../../controllers");
const { renewalsValidation } = require('../../validations')



router
    .route("/AllRenewals/:type")
    .post(renewalsProcessController.getAllRenewals)

    router
    .route("/employeeDetails/:renewalsId").all(verifyToken)
    .post(renewalsProcessController.renewalsEmployeeDetails)

router
    .route("/").all(verifyToken)
    .post(renewalsProcessController.createRenewals)
    .get(renewalsProcessController.listAllRenewals)

router
    .route("/id/:renewalsId").all(verifyToken)
    .get(renewalsProcessController.getRenewalsById)

router
    .route("/:renewalsId").all(verifyToken)
    .patch(validate(renewalsValidation.updateRenewal), renewalsProcessController.updateRenewalsOnId)

router
    .route("/userid/:userId").all(verifyToken)
    .get(renewalsProcessController.getRenewalsOnUserId)

router
    .route("/process/forward/:renewalsId").all(verifyToken)
    .post(renewalsProcessController.renewalsProcessFlowForward)

router
    .route("/get_status_count").all(verifyToken)
    .get(renewalsProcessController.getRenewalStatusCount)

router
    .route("/process/backward/:renewalsId").all(verifyToken)
    .post(renewalsProcessController.renewalsProcessBackward)

router
    .route("/clear/table").all(verifyToken)
    .put(renewalsProcessController.clearRenewalsTable)

module.exports = router