const express = require('express');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { approvalsController } = require('../../controllers');
const { approvalsValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .all(verifyToken)
  .get(approvalsController.getAllApprovals)
  .post(validate(approvalsValidation.createApproval), approvalsController.createApprovals);

router
  .route('/:approvalId')
  .all(verifyToken)
  .get(validate(approvalsValidation.getApprovalsOnId), approvalsController.getApprovalsOnId)
  .put(validate(approvalsValidation.updateApprovals), approvalsController.updateApprovalsOnID)
  .delete(validate(approvalsValidation.deleteApprovalsOnId), approvalsController.deleteApprovalsOnId);

router.route('/company/:company_ID').all(verifyToken).get(approvalsController.getApprovalsOnCompanyID);

router
  .route('/user/:userId')
  .all(verifyToken)
  .get(approvalsController.getApprovalsOnUserId)
  .post(validate(approvalsValidation.createApprovals), approvalsController.createOrUpdateApprovalsOnUserId);

router.route('/users').all(verifyToken).post(approvalsController.getApprovalsOnUserIds);

router.route('/approver/:approverId').all(verifyToken).get(approvalsController.getApprovalsWithApproverId);

router.route('/approver/replace').all(verifyToken).post(approvalsController.replaceApproverId);

module.exports = router;
