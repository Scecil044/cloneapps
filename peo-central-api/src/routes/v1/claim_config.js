const express = require("express");

const router = express.Router()
const { claimConfigController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { claimConfigValidation } = require('../../validations')
// .all(verifyToken)

router
  .route('/getClaimConfig')
  .post(claimConfigController.getClaimConfig)

router.route('/',validate(claimConfigValidation.create))
  .post(claimConfigController.create)

router
  .route('/:company_ID')
  .patch(claimConfigController.update)

router
  .route('/:id')
  .delete(claimConfigController.remove)

module.exports = router;
