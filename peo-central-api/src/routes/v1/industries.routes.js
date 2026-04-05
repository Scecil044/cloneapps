const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { industryValidations } = require("../../validations");
const industriesController = require('../../controllers/industriesController');

const router = express.Router();

// Create a new industry
router
  .route('/')
  .post(verifyToken, validate(industryValidations.createIndustry), industriesController.createIndustry)
  .get(industriesController.getAllIndustries);

// Get, update, or delete industry by ID
router
  .route('/:industryId')
  .get(verifyToken, validate(industryValidations.getIndustry), industriesController.getIndustryById)
  .patch(verifyToken, validate(industryValidations.updateIndustry), industriesController.updateIndustry)
  .delete(verifyToken, validate(industryValidations.deleteIndustry), industriesController.deleteIndustry);

module.exports = router;
