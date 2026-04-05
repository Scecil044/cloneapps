const express = require('express');
const { dashboardController } = require('../../controllers');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');

const router = express.Router();

router.route('/recent/visa-processes').post(verifyToken, dashboardController.fetchRecentVisaProcesses);
router.route('/recent/offboardings').post(verifyToken, dashboardController.recentOffboardings);
router.route('/recent/onboardings').post(verifyToken, dashboardController.recentOnboardings);
router.route('/recent/renewals').post(verifyToken, dashboardController.recentRenewals);
router.route('/get/client/tasks').post(verifyToken, dashboardController.fetchClientTasks);
router.route('/recent/tickets').post(verifyToken, dashboardController.recentTickets);
router.route('/recent/tickets-count').post(verifyToken, dashboardController.ticketCounts);
router.route('/stats').post(verifyToken, dashboardController.statsCard);
router.route('/clientstats').post(verifyToken, dashboardController.getClientStats);



module.exports = router;
