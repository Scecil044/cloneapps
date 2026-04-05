const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { documentTemplateController } = require("../../controllers");
const { documentTemplateCloneController } = require("../../controllers");
const { emailTemplateValidation } = require("../../validations");
const validate = require('../../middlewares/validate');
const { emailTemplateController } = require("../../controllers");

router
    .route("/:_id").all(verifyToken)
    .get(documentTemplateCloneController.getTemplate)

router
    .route("/add").all(verifyToken)
    .post(validate(emailTemplateValidation.createEmail), emailTemplateController.addNewTemplate)

router
    .route("/create").all(verifyToken)
    .post(emailTemplateController.addNewEmailTemplate)

router
    .route("/get/all").all(verifyToken)
    .get(emailTemplateController.listAllEmailTemplates)

router
    .route("/id/:emailTemplateId").all(verifyToken)
    .get(emailTemplateController.getEmailTemplatesOnID)

router
    .route("/:emailTemplateId").all(verifyToken)
    .patch(emailTemplateController.updateEmailTemplateOnId)
    .delete(emailTemplateController.deleteEmailTemplateOnId)

router
    .route("/").all(verifyToken)
    .get(emailTemplateController.getEmailTemplateOnIDWithoutContent)

router.route("/by/name").all(verifyToken).get(validate(emailTemplateValidation.getEmailTemplateByName), emailTemplateController.getEmailTemplateByName);

module.exports = router;