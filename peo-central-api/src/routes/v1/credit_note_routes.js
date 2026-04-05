const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { creditNoteController } = require('../../controllers');
const { creditNoteValidations } = require('../../validations');

const router = express.Router();

router
  .route('/create')
  .all(verifyToken)
  .post(creditNoteController.generateCreditNote);

router
  .route('/generate')
  .all(verifyToken)
  .post(creditNoteController.generateCreditNote);

router
  .route('/setup-preview')
  .all(verifyToken)
  .post(creditNoteController.setupCreditNotePreview);

router
  .route('/getpreview')
  .all(verifyToken)
  .post(creditNoteController.getCreditNotePreview);

router
  .route('/check-existing-draft')
  .all(verifyToken)
  .get(creditNoteController.checkExistingDraft);

router
  .route('/generate-number')
  .all(verifyToken)
  .post(creditNoteController.generateCreditNoteNumber);

router
  .route('/apply/credit/:creditNoteId')
  .all(verifyToken)
  .post(creditNoteController.applyCreditNote);

router
  .route('/check-existing')
  .all(verifyToken)
  .get(creditNoteController.checkExistingCreditNote);

router
  .route('/update/:creditNoteId')
  .all(verifyToken)
  .put(creditNoteController.updateCreditNote);

router
  .route('/:creditNoteId')
  .all(verifyToken)
  .get(validate(creditNoteValidations.findCreditNoteById), creditNoteController.findCreditNoteById);

router
  .route('/get/all')
  .all(verifyToken)
  .get(creditNoteController.getAllCreditNotes);

router
  .route('/get/stats')
  .all(verifyToken)
  .get(creditNoteController.getCreditNoteStats);

router
  .route('/pdf/preview/:creditNoteId')
  .all(verifyToken)
  .get(validate(creditNoteValidations.getCreditNotePdfPreview), creditNoteController.getCreditNotePdfPreview);

router
  .route('/getpreviewpdf')
  .all(verifyToken)
  .post(creditNoteController.getCreditNotePdfPreview);

router
  .route('/preview/:creditNoteId')
  .all(verifyToken)
  .get(validate(creditNoteValidations.getCreditNotePdfPreview), creditNoteController.getCreditNotePreview);

router
  .route('/filter/status')
  .all(verifyToken)
  .post(validate(creditNoteValidations.filterCreditNotesByStatus), creditNoteController.filterCreditNotesByStatus);

router
  .route('/delete')
  .all(verifyToken)
  .delete(validate(creditNoteValidations.deleteCreditNote), creditNoteController.deleteCreditNote);

  router
  .route('/available/credit-notes/:invoiceId')
  .all(verifyToken)
  .post(creditNoteController.getAvailableCreditNotesByInvoiceId);

router
  .route('/approve')
  .all(verifyToken)
  .post(creditNoteController.approveCreditNote);

router
  .route('/void/:creditNoteId')
  .all(verifyToken)
  .patch(creditNoteController.voidCreditNote);

router
  .route('/unapply')
  .all(verifyToken)
  .post(validate(creditNoteValidations.unapplyCredit), creditNoteController.unapplyCreditNote);

router
  .route('/available/custom')
  .all(verifyToken)
  .get(creditNoteController.getAvailableCustomCreditNotes);

module.exports = router;
