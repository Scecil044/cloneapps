const { emailTemplateCloneController } = require('../../controllers')
const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');

router
    .route("/")
    .post(emailTemplateCloneController.createEmailTemplateClone)
    .get(emailTemplateCloneController.listAllEmailTemplateClone)


router
    .route("/cloneid/:cloneID")
    .get(emailTemplateCloneController.getEmailTemplateCloneById)

router
    .route("/:cloneID")
    .patch(emailTemplateCloneController.updateEmailTemplateCloneOnId)
    .delete(emailTemplateCloneController.deleteEmailTemplateClone)

router
    .route("/get/id/:EmailTempltCloneID").all(verifyToken)
    .get(emailTemplateCloneController.getEmailTemplateOnIDWithoutContent)

router
    .route("/autoreplace/:EmailTempltCloneID").all(verifyToken)
    .get(emailTemplateCloneController.getEmailTemplate)

module.exports = router