const express = require("express");
const { documentsFolderController} = require("../../controllers")
const verifyToken = require("../../middlewares/verifyToken");
const validate = require("../../middlewares/validate");
const {documentFolderValidations} = require("../../validations")
const router = express.Router();

router.route("/get/id/:folderId").get(verifyToken,documentsFolderController.findFolderById);

router.route("/get/all").get(verifyToken,documentsFolderController.getDocumentsFolders);

router.route("/get/folder/documents/:folderId").get(verifyToken,documentsFolderController.fetchFolderDocuments);

router.route("/create/new").post(verifyToken, validate(documentFolderValidations.createDocumentFolder),documentsFolderController.createDocumentsFolder);

router.route("/update/:folderId").put(verifyToken,documentsFolderController.updateDocumentsFolder);
router.route("/update/:folderId/add-file").put(verifyToken,documentsFolderController.addFileToFolder);

router.route("/delete/:folderId").delete(verifyToken,documentsFolderController.deleteDocumentsFolder);

router.route("/delete/:folderId/:documentId").delete(verifyToken,documentsFolderController.markFileAsDeleted);



module.exports = router;