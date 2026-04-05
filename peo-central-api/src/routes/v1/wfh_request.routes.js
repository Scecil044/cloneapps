const express = require("express")
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const { wfhRequestController} = require("../../controllers");

router
    .route("/new").all(verifyToken)
    .post(wfhRequestController.createWfhRequest)

router
    .route("/withdraw").all(verifyToken)
    .post(wfhRequestController.withdrawWfhRequest)

router
    .route("/approve").all(verifyToken)
    .post(wfhRequestController.approveWfhRequest)

router
    .route("/reject").all(verifyToken)
    .post(wfhRequestController.rejectWfhRequest)

router
    .route("/reassign").all(verifyToken)
    .post(wfhRequestController.reassignWfhRequest)

router
    .route("/get_user_wfh_count").all(verifyToken)
    .get(wfhRequestController.getUserWfhCount)

router
    .route("/get_all_wfh").all(verifyToken)
    .get(wfhRequestController.getAllWFHRequests)

router
    .route("/dept").all(verifyToken)
    .post(wfhRequestController.wfhDept)

router
    // ....../get_number_of_days
    .route("/number_of_days").all(verifyToken)
    .post(wfhRequestController.getNumOfWfhDays)

router
    // ....../get_all_requests
    .route('/get/all').all(verifyToken)
    .get(wfhRequestController.getAllWfhRequestsOnUserId)

router
    // ....../today/all
    .route('/get/today/all').all(verifyToken)
    .get(wfhRequestController.getAllWfhRequestsToday)

router
    .route('/get/user/:userId/:date')
    .get(wfhRequestController.getUserWfhRequests)

module.exports = router