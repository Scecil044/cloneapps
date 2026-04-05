const express = require("express")
const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { documentTypesController } = require("../../controllers");

router
    .route("/").all(verifyToken)
    .post(documentTypesController.createDocumentType)
    .get(documentTypesController.listAllDocumentTypes)

router
    .route("/doctype/:documentId").all(verifyToken)
    .get(documentTypesController.documentTypeById)

router
    .route("/:documentId").all(verifyToken)
    .patch(documentTypesController.updateDocumentTypeOnId)
    .delete(documentTypesController.deleteDocumentType)

router
    .route("/type/:type").all(verifyToken)
    .get(documentTypesController.getDocumentTypeOnTheType)

router
.route("/list").all(verifyToken)
.post(documentTypesController.getDocumentList)

module.exports = router;