const express = require('express');
const { partnersController } = require('../../controllers');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { partnerValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .all(verifyToken)
  .post(validate(partnerValidation.createPartner), partnersController.createPartner)
  .get(partnersController.getPartners);

router
  .route('/:partnerId')
  .all(verifyToken)
  .get(validate(partnerValidation.getPartnerById), partnersController.getPartnerById)
  .put(partnersController.updatePartnership)
  .delete(validate(partnerValidation.deletePartner), partnersController.deletePartnerById);

router.route('/get/count_all').all(verifyToken).get(partnersController.getPartnershipStats);
router.route('/bulk/upload').all(verifyToken).put(partnersController.bulkUploadPartners);

module.exports = router;
