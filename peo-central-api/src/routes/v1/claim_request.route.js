const express = require('express');

const router = express.Router()
const verifyToken = require('../../middlewares/verifyToken');
const { claimRequestController } = require('../../controllers');

router
    .route("/new").all(verifyToken)
    .post(claimRequestController.createClaimRequest)

router
    .route("/draft/:draftId").all(verifyToken)
    .delete(claimRequestController.deleteClaimDraftRequest)

router
    .route("/withdraw").all(verifyToken)
    .post(claimRequestController.withdrawClaimRequest)

router
    .route("/approve").all(verifyToken)
    .post(claimRequestController.approveClaimRequest)

router
    .route("/reject").all(verifyToken)
    .post(claimRequestController.rejectClaimRequest)

router
    .route("/reassign").all(verifyToken)
    .post(claimRequestController.reassignClaimRequest)

router
    .route("/clarification").all(verifyToken)
    .post(claimRequestController.requiresClarificationClaimRequest)

router
    .route("/user/clarify").all(verifyToken)
    .post(claimRequestController.clarifyClaimRequest)

router
    .route('/types/:userId').all(verifyToken)
    .get(claimRequestController.getClaimtypes)

router
    // ....../get_claim_types/:_id
    .route('/subtypes/:userId').all(verifyToken)
    .get(claimRequestController.getClaimsubtypes)

router
    .route('/get/receipt/:claimId').all(verifyToken)
    .get(claimRequestController.getClaimReceipt)

module.exports = router;
