const express = require('express');
const router = express.Router();
const { enrollmentsController } = require("../../controllers");
const {enrollmentValidations} = require("../../validations");
const validate = require("../../middlewares/validate")

router
  .route('/')
  .get(enrollmentsController.listAllEnrollments)
  .post(enrollmentsController.createEnrollment);

router.route("/email").get(enrollmentsController.getEntrollmentByCompanyEmail);

router.route("/companyId/:companyId").get(enrollmentsController.getEnrollmentByCompanyId);


router
  .route('/:enrollmentId')
  .get(enrollmentsController.getEnrollmentById)
  .put(enrollmentsController.updateEnrollmentById)
  .delete(enrollmentsController.deleteEnrollmentById);

router
  .route('/initialEmail/:enrollmentId')
  .post(enrollmentsController.sendInitialEmail);

router
  .route('/confirmationemail/:enrollmentId')
  .post(enrollmentsController.sendConfirmationEmail);

router
  .route('/verify/:enrollmentId')
  .put(enrollmentsController.verifyEnrollment);

router
  .route('/upload/:enrollmentId')
  .post(enrollmentsController.uploadFiles);


module.exports = router;
