const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { dependentsController } = require('../../controllers');
const { dependentsValidations } = require('../../validations');

const router = express.Router();

router
  .route('/get/all')
  .all(verifyToken)
  .get(dependentsController.filterDependents);

router
  .route('/create/new')
  .all(verifyToken)
  .post(validate(dependentsValidations.createNewDependent), dependentsController.createNewDependent);

router
  .route('/update/:dependentId')
  .all(verifyToken)
  .put(validate(dependentsValidations.updateDependent), dependentsController.updateDependent);

router
  .route('/delete/:dependentId')
  .all(verifyToken)
  .delete(validate(dependentsValidations.deleteDependent), dependentsController.deleteDependent);

module.exports = router;
