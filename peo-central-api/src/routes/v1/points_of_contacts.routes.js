const express = require('express');
const { pointsOfContactController } = require('../../controllers');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { pocValidations } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .all(verifyToken)
  .get(pointsOfContactController.fatchPointOfContacts)
  .post(validate(pocValidations.createNewPointOfContact), pointsOfContactController.createNewPointOfContact);

router
  .route('/stats')
  .all(verifyToken)
  .get(pointsOfContactController.getPointsOfContactStats);

router
  .route('/email/logs')
  .all(verifyToken)
  .post(pointsOfContactController.fetchPocEmails);

router
  .route('/:pocId')
  .all(verifyToken)
  .put(validate(pocValidations.updatePointOfContact), pointsOfContactController.updatePointOfContact);

// POC profile update endpoint (for POC users updating their own profile)
router
  .route('/profile')
  .all(verifyToken)
  .put(pointsOfContactController.updatePocProfile);

module.exports = router;
