const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { apiKeyController } = require('../../controllers');
const { apiKeyValidation } = require('../../validations');

// Generate a new API key (requires authentication)
router.route('/generate')
  .all(verifyToken)
  .post(validate(apiKeyValidation.generateApiKey), apiKeyController.generateApiKey);

// Verify an API key (requires authentication)
router.route('/verify')
  .all(verifyToken)
  .post(validate(apiKeyValidation.verifyApiKey), apiKeyController.verifyApiKey);

module.exports = router;
