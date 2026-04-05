const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { documentTemplateController } = require("../../controllers");
const { documentTemplateValidation } = require("../../validations");
const validate = require('../../middlewares/validate');

router
    .route("/templateid/:templateId").all(verifyToken)
    .get(documentTemplateController.getDocTemplatesOnID)
    
router
    .route("/add").all(verifyToken)
    .post(validate(documentTemplateValidation.createDocument), documentTemplateController.addNewTemplate)

router
    .route("/list/all").all(verifyToken)
    .post(documentTemplateController.listAllDocumentTemplates)

router
    .route("/:templateId").all(verifyToken)
    .patch(documentTemplateController.updateDocumentTemplateOnId)
    .delete(documentTemplateController.deleteDocumentTemplate)
    
module.exports = router;