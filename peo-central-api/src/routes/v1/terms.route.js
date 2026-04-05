const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { termsController } = require('../../controllers');
const { termsValidations } = require('../../validations');
router
  .route('/')
  .all(verifyToken)
  .get(termsController.listAllTerms)
  .post(validate(termsValidations.createNewTerm), termsController.createNewTerm);

module.exports = router;
