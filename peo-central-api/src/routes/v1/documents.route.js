const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const verifyOnboardingToken = require('../../middlewares/verifyOnboardingToken');
const validate = require('../../middlewares/validate');
const { documentsValidation } = require('../../validations');
const { documentsController } = require('../../controllers');

router.route('/client-simpleupload').post(documentsController.simpleDocumentUpload);

// New route for onboarding document uploads
router.route('/onboarding-simpleupload').post(verifyOnboardingToken, documentsController.onboardingDocumentUpload);

router
  .route('/')
  .all(verifyToken)
  .put(validate(documentsValidation.createDocument), documentsController.createRecord)
  .post(validate(documentsValidation.createDocument), documentsController.createDocument)
  .get(documentsController.listAllDocuments);

router
  .route('/doc/:documentId')
  .all(verifyToken)
  .get(validate(documentsValidation.documentById), documentsController.documentById);

router
  .route('/:documentId')
  .all(verifyToken)
  .patch(validate(documentsValidation.updateDocumentOnId), documentsController.updateDocumentOnId)
  .delete(validate(documentsValidation.documentById), documentsController.deleteDocument);

router.route('/upload/docid/foreignid').all(verifyToken).post(documentsController.uploadDocumentsOnDocIdAndForeignId);

router.route('/simpleupload').post(documentsController.simpleDocumentUpload);


router.route('/mimetype/upload').all(verifyToken).post(documentsController.simpleDocumentUploadWithMimeTypes);

router.route('/simpleuploadbase64').all(verifyToken).post(documentsController.simpleDocumentUploadBase64);

router.route('/foreignid/:foreignId').all(verifyToken).get(documentsController.documentOnForeignId);

router.route('/foreignid/identifier').all(verifyToken).post(documentsController.getDocumentsByForeignIdAndIdentifier);

router.route('/foreignid/type').all(verifyToken).post(documentsController.getDocumentsByForeignIdAndType);

router
  .route('/filter/foreignid/userid')
  .all(verifyToken)
  .post(documentsController.documentsFilterOnCompanyidAndUseridAndStatus);

router.route('/listing/page/all').all(verifyToken).post(documentsController.getAllDocumentsForListingPage);

router.route('/list/status').all(verifyToken).post(documentsController.listOfDocumentStatus);

router.route('/identifier/foreignid').all(verifyToken).post(documentsController.documentOnForeignIdAndIdentifier);

router.route('/expirytrigger').all(verifyToken).post(documentsController.triggerExpiry);

router.route('/expiryindividualtrigger').all(verifyToken).post(documentsController.triggerIndividualExpiry);

// Add download route to handle file downloads with authentication
router.route('/download').all(verifyToken).post(documentsController.downloadDocument);

module.exports = router;
