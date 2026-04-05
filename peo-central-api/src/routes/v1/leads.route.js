const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { leadsValidation } = require("../../validations");
const { leadsController } = require("../../controllers");

router
  .route('/')
  .all(verifyToken)
  // .post(validate(leadsValidation.createLeads), leadsController.createLeads)
  .post(leadsController.createLeads)
  .get(leadsController.listAllLeads);

router
    .route("/service/:leadsId").all(verifyToken)
    .get(validate(leadsValidation.leadsById), leadsController.leadsById)

router
    .route("/reassign/:leadsId").all(verifyToken)
    .post(leadsController.reassignLeadById)

router
  .route('/:leadsId')
  .all(verifyToken)
  // .patch(validate(leadsValidation.updateLeads), leadsController.updateLeadsOnId)
  .patch(leadsController.updateLeadsOnId)
  .delete(validate(leadsValidation.leadsById), leadsController.deleteLeads);

router
    .route("/companyid/:companyId").all(verifyToken)
    .get(validate(leadsValidation.leadsOnCompanyId), leadsController.leadsOnCompanyID)

router
    .route("/status/:status").all(verifyToken)
    .get(leadsController.leadsOnStatus)

router
    .route("/search/filter").all(verifyToken)
    .post(leadsController.leadsFilterAndSearch)

router
    .route("/details/leadsid").all(verifyToken)
    .post(leadsController.leadsDetailsOnLeadsId)

router
    .route("/mark/unsuccessful/:leadsId").all(verifyToken)
    .post(leadsController.markUnsuccessful)

router
    .route("/process/moveforward/:leadsId").all(verifyToken)
    .post(leadsController.leadProgressStageMoveForward)

router
    .route("/process/movebackward/:leadsId").all(verifyToken)
    .post(leadsController.leadProgressStageMoveBackward)

router
    .route("/list/unsuccessful").all(verifyToken)
    .post(leadsController.listOfUnsuccessfulLeads)

router
    .route("/unsuccessful/details/:leadsId").all(verifyToken)
    .post(leadsController.getUnsuccessfulLeadsDetailsOnID)

router
    .route("/pipeline").all(verifyToken)
    .get(leadsController.getLeadsPipeline)

router
    .route("/pipeline/list").all(verifyToken)
    .get(leadsController.getDiffPipelineList)

router
    .route("/unsuccessful/search/filter").all(verifyToken)
    .post(leadsController.leadsFilterAndSearchForUnsuccessuful)

router
    .route("/remove/unsuccessful/:leadsId").all(verifyToken)
    .post(leadsController.removeFromUnsuccessful)

router
    .route("/status/list").all(verifyToken)
    .post(leadsController.listOfLeadsStatus)

router
    .route("/counts").all(verifyToken)
    .post(leadsController.getLeadsCounts)

router
    .route("/conversion-rate").all(verifyToken)
    .get(leadsController.getConversionRate)

router
    .route("/hold/:leadId").all(verifyToken)
    .post(leadsController.holdLeads)

router
    .route("/get_status_count").all(verifyToken)
    .get(leadsController.getLeadStatusCount)

router
    .route("/bulk/upload").all(verifyToken)
    .post(leadsController.bulkUploadLeads)

router
    .route("/bulk/template")
    .get(leadsController.exportBulkUploadTemplate)

module.exports = router;
