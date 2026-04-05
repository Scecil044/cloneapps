const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { visaProcessController } = require('../../controllers');
const { visaprocessValidations} = require("../../validations")

router
  .route('/')
  .all(verifyToken)
  .post(visaProcessController.createVisaProcess)
  .get(visaProcessController.listAllVisaProcess);

router.route('/id/:visaId').all(verifyToken).get(visaProcessController.getVisaProcessById);

router.route('/:visaId').all(verifyToken).patch(visaProcessController.updateVisaProcessOnId);

router.route('/userid/:userId').all(verifyToken).get(visaProcessController.getVisaProcessOnUserId);

router.route('/visa/process/forward/:visaId').all(verifyToken).post(visaProcessController.visaProcessFlowForward);

router.route('/visa/process/step/complete/:visaId').all(verifyToken).post(visaProcessController.visaProcessFlowCompleteStep);

router
  .route('/visa/renewal/process/backward/:visaId')
  .all(verifyToken)
  .post(visaProcessController.visaRenewalProcessFlowBackward);

router.route('/pipeline').all(verifyToken).get(visaProcessController.getVisaProcessPipelineCount);

router.route('/pipeline/list').all(verifyToken).get(visaProcessController.getVisaDiffPipelineList);

router.route('/list/status').all(verifyToken).post(visaProcessController.listOfVisaProcessStatus);

router.route('/list/section/stage').all(verifyToken).post(visaProcessController.listOnProcessStatus);

router.route('/create/new/visa/process').all(verifyToken).post(visaProcessController.createNewVisa);

router.route('/create/renewal/visa/process').all(verifyToken).post(visaProcessController.createVisaRenewals);

router.route('/create/cancellation/visa/process').all(verifyToken).post(visaProcessController.createVisaCancellation);

router.route('/create').all(verifyToken).post(visaProcessController.createProcessVisa);

router.route('/pipeline/process').all(verifyToken).post(visaProcessController.visaProcessPipelineListAndCount);

router.route('/findbyprocess').all(verifyToken).post(visaProcessController.findByProcess);

router.route('/distribution').all(verifyToken).post(visaProcessController.Distribution);

router.route('/comment/:visaId').all(verifyToken).put(visaProcessController.commentOnVisaProcessDoc);

router.route('/id/:visaId/:processId').all(verifyToken).put(visaProcessController.commentOnVisaProcess);

router.route('/read/comments/id/:visaId/:processId').all(verifyToken).put(visaProcessController.markCommentsAsRead);

router.route('/comments/:visaId/:processId').all(verifyToken).get(visaProcessController.getCommentsOSpecificProcess);

router.route('/comments/:visaId/:processId/:commentId').put(verifyToken).put(visaProcessController.updateCommentInVisaProcess);

router.route('/comments/:visaId/:processId/:commentId').all(verifyToken).delete(visaProcessController.deleteCommentFromVisaProcess);

router.route('/clear/comments/:visaId').all(verifyToken).put(visaProcessController.clearVisaProcessComments);

router.route('/clear/comments/:visaId/:processId').all(verifyToken).put(visaProcessController.clearProcessComments);

router.route('/mark/unsuccessful').all(verifyToken).put(validate(visaprocessValidations.markAsUbsuccessful),visaProcessController.markAsUnsuccessful);

module.exports = router;
