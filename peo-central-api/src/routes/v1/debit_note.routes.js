const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { debitNoteController } = require('../../controllers');
const { debitNoteValidations } = require('../../validations');

const router = express.Router();

router
  .route('/create')
  .all(verifyToken)
  .post(debitNoteController.generateDebitNote);

router
  .route('/generate')
  .all(verifyToken)
  .post(debitNoteController.generateDebitNote);

router
  .route('/setup-preview')
  .all(verifyToken)
  .post(debitNoteController.setupDebitNotePreview);

router
  .route('/check-existing-draft')
  .all(verifyToken)
  .get(debitNoteController.checkExistingDraft);

router
  .route('/generate-number')
  .all(verifyToken)
  .post(debitNoteController.generateDebitNoteNumber);

router
  .route('/apply/debit/:debitNoteId')
  .all(verifyToken)
  .post(debitNoteController.applyDebitNote);

router
  .route('/check-existing')
  .all(verifyToken)
  .get(debitNoteController.checkExistingDebitNote);

router
  .route('/update/:debitNoteId')
  .all(verifyToken)
  .put(debitNoteController.updateDebitNote);

router
  .route('/:debitNoteId')
  .all(verifyToken)
  .get(validate(debitNoteValidations.findDebitNoteById), debitNoteController.findDebitNoteById);

router
  .route('/get/all')
  .all(verifyToken)
  .get(debitNoteController.getAllDebitNotes);

router
  .route('/get/stats')
  .all(verifyToken)
  .get(debitNoteController.getDebitNoteStats);

router
  .route('/pdf/preview/:debitNoteId')
  .all(verifyToken)
  .get(validate(debitNoteValidations.getDebitNotePdfPreview), debitNoteController.getDebitNotePdfPreview);

router
  .route('/getpreviewpdf')
  .all(verifyToken)
  .post(debitNoteController.getDebitNotePdfPreview);

router
  .route('/preview/:debitNoteId')
  .all(verifyToken)
  .get(validate(debitNoteValidations.getDebitNotePdfPreview), debitNoteController.getDebitNotePreview);

router
  .route('/filter/status')
  .all(verifyToken)
  .post(validate(debitNoteValidations.filterDebitNotesByStatus), debitNoteController.filterDebitNotesByStatus);

router
  .route('/delete')
  .all(verifyToken)
  .delete(validate(debitNoteValidations.deleteDebitNote), debitNoteController.deleteDebitNote);

  router
  .route('/available/debit-notes/:invoiceId')
  .all(verifyToken)
  .post(debitNoteController.getAvailableDebitNotesByInvoiceId);

router
  .route('/approve')
  .all(verifyToken)
  .post(debitNoteController.approveDebitNote);

router
  .route('/void/:debitNoteId')
  .all(verifyToken)
  .patch(debitNoteController.voidDebitNote);

router
  .route('/unapply')
  .all(verifyToken)
  .post(validate(debitNoteValidations.unapplyDebit), debitNoteController.unapplyDebitNote);

module.exports = router;
