const express = require("express")
const router = express.Router()
const { documentTemplateCloneController } = require("../../controllers");
const verifyToken = require('../../middlewares/verifyToken');

router
    .route("/updatevalue/:_id").all(verifyToken)
    .post(documentTemplateCloneController.getTemplate)

router
    .route("/editdocument").all(verifyToken)
    .post(documentTemplateCloneController.editTemplate)


router
    .route("/get/id/:DocTempltCloneID").all(verifyToken)
    .post(documentTemplateCloneController.getDocTemplateOnIDWithoutContent)

router    
    .route("/get/replacedcontent/:DocTempltCloneID").all(verifyToken)
    .post(documentTemplateCloneController.getReplacedContent)

router
    .route("/get/replacedcontentfile/:DocTempltCloneID").all(verifyToken)
    .post(documentTemplateCloneController.getReplacedContentFile)



router
    .route("/")
    .post(documentTemplateCloneController.createDocumentTemplateClone)
    .get(documentTemplateCloneController.listAllDocumentTemplateClone)

router
    .route("/cloneid/:cloneID")
    .get(documentTemplateCloneController.getDocumentTemplateCloneById)

router
    .route("/:cloneID")
    .patch(documentTemplateCloneController.updateDocumentTemplateCloneOnId)

router
    .route("/workOrderCount/:type")
    .post(documentTemplateCloneController.getWorkOrderCount)

module.exports = router