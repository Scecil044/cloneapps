const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { documentTemplateController } = require("../../controllers");
const { documentTemplateCloneController } = require("../../controllers");
const { smsTemplateValidation } = require("../../validations");
const validate = require('../../middlewares/validate');
const { smsTemplateController } = require("../../controllers");

router
    .route("/:_id").all(verifyToken)
    .get(documentTemplateCloneController.getTemplate)

router
    .route("/add").all(verifyToken)
    .post(validate(smsTemplateValidation.createSMS), smsTemplateController.addNewTemplate)

router
    .route("/create").all(verifyToken)
    .post(smsTemplateController.addNewSMSTemplate)

router
    .route("/get/all").all(verifyToken)
    .get(smsTemplateController.listAllSMSTemplates)

router
    .route("/id/:smsTemplateId").all(verifyToken)
    .get(smsTemplateController.getSMSTemplatesOnID)

router
    .route("/:smsTemplateId").all(verifyToken)
    .patch(smsTemplateController.updateSMSTemplateOnId)
    .delete(smsTemplateController.deleteSMSTemplateOnId)

router
    .route("/").all(verifyToken)
    .get(smsTemplateController.getSMSTemplateOnIDWithoutContent)


router
    .route("/sendSms").all(verifyToken)
    .post(smsTemplateController.sendSms)

module.exports = router;