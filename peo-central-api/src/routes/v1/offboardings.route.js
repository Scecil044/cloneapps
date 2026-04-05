const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { offboardingsController } = require('../../controllers');

router
  .route('/')
  .all(verifyToken)
  .post(offboardingsController.createOffboardings)
  .get(offboardingsController.listAllOffboardings);

router.route('/id/:offboardingId').all(verifyToken).get(offboardingsController.getOffboardingsById);

router.route('/:offboardingId').all(verifyToken).patch(offboardingsController.updateOffboardingsOnId);

router.route('/userid/:userId').all(verifyToken).get(offboardingsController.getOffboardingsOnUserId);

router.route('/:userId/:offBoardingId').all(verifyToken).put(offboardingsController.removeEmployeeFromOffBoarding);

router
  .route('/offboarding/process/forward/:offboardingId')
  .all(verifyToken)
  .post(offboardingsController.offboardingProcessFlowForward);

router
  .route('/offboarding/process/backward/:offboardingId')
  .all(verifyToken)
  .post(offboardingsController.offboardingProcessFlowBackward);

router.route('/get_offboardings').all(verifyToken).get(offboardingsController.getOffBoardings);

router.route('/pipeline').all(verifyToken).get(offboardingsController.offboardingPipeline);

router.route('/get_status_count').all(verifyToken).post(offboardingsController.getOffboardingStatusCount);

router.route('/pipeline/list').all(verifyToken).get(offboardingsController.getPipelineList);

router.route('/details/id/:offboardingId').all(verifyToken).post(offboardingsController.getOffboardingDataOnID);

router.route('/list/status').all(verifyToken).post(offboardingsController.listOfOffboardingStatus);

router
  .route('/employee/details/:offboardingId')
  .all(verifyToken)
  .post(offboardingsController.extendedListOfUsersAndCompanies);

router.route('/distribution').all(verifyToken).post(offboardingsController.getDashboardCount);

module.exports = router;
