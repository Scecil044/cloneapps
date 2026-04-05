const express = require('express');
const router = express.Router();
const verifyApiKey = require('../../middlewares/verifyApiKey');
const { industriesController, inquiryController } = require('../../controllers');
const checkOrigin = require("../../middlewares/originCheck")

/**
 * External API routes that use API key authentication
 * These routes can be accessed by external applications using an API key
 * in the X-API-Key header instead of a JWT token
 */

// Get all industries (requires API key)
router.route('/industries')
  .all(verifyApiKey)
  .get(industriesController.getAllIndustries);

// Get industry by ID (requires API key)
router.route('/industries/:industryId')
  .all(verifyApiKey)
  .get(industriesController.getIndustryById);

router.route('/create/inquiry')
  .all(verifyApiKey)
  .post(inquiryController.createInquiry);

module.exports = router;
