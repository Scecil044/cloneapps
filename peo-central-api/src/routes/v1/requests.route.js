const express = require('express');
const { requestsController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const verifyToken = require('../../middlewares/verifyToken');

const router = express.Router();

router.route('/count').post(requestsController.getRequestsCount);

router.route('/upcoming').all(verifyToken).post(requestsController.upcomingRequests);

router.route('/get_requests_users_info').all(verifyToken).post(requestsController.getRequestUsersInfo);

router.route('/get_all_requests').all(verifyToken).post(requestsController.getAllRequest);

// old api -leaves/department/:dept")
router.route('/department/:dept').all(verifyToken).get(requestsController.getRequestsByDepartment);

router.route('/payroll-report/count/:company_id/:pay_month').get(requestsController.getPayrollReportCountByCompanyId);

router.route('/users/:userId').all(verifyToken).post(requestsController.userRequest);

router.route('/all').all(verifyToken).post(requestsController.getAllRequestsAndSpecificRequests);

router
  // ....../get_all_requests_count_bydate
  .route('/counts/date')
  .all(verifyToken)
  .post(requestsController.getAllRequestCountsOnDate);

router
  // ....../get_all_processing_requests_count
  .route('/count/all/pending')
  .all(verifyToken)
  .post(requestsController.getAllPendingRequestCounts);

router
  // ....../get_all_requests_count/:user_id
  .route('/count/user/:userId')
  .all(verifyToken)
  .post(requestsController.getRequestCountsOnUserId);

router
  // ....../get_leave_history
  .route('/history/leave/wfh')
  .all(verifyToken)
  .post(requestsController.getLeaveAndWfhHistory);

router
  // ...../each_leave_count_weekly
  .route('/count/weekly')
  .all(verifyToken)
  .post(requestsController.getEachLeaveCountWeekly);

router
  // ....../update-request/:_id
  .route('/update/:requestId')
  .all(verifyToken)
  .put(requestsController.updateRequests);

router.route('/:_id').all(verifyToken).get(requestsController.getRequestDetails);

router.route('/approvers/:_id').all(verifyToken).get(requestsController.getRequestApproverDetails);

router.route('/generate/reference_number').all(verifyToken).post(requestsController.generateReferenceNumber);

module.exports = router;
