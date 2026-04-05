const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { SmsController } = require('../../controllers');

router
  .route('/all')
  .all(verifyToken)
  .get(SmsController.getAllSms);


router
  .route('/create')
//   .all(verifyToken)
  .post(SmsController.createSms);


router
  .route('/update/:id')
  .all(verifyToken)
  .patch(SmsController.UpdateSms);


router
  .route('/delete/:id')
  .all(verifyToken) 
  .patch(SmsController.DeleteSms);


  router
  .route('/getsms/:id')
  .all(verifyToken)
  .get(SmsController.getSmsDetails);

module.exports = router;
