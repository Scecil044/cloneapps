const express = require('express');
const { letterRequestController } = require('../../controllers');
const verifyToken = require('../../middlewares/verifyToken');

const router = express.Router();

router.route('/new').all(verifyToken).post(letterRequestController.createLetterRequest);

router.route('/withdraw').all(verifyToken).post(letterRequestController.withdrawLetterRequest);

router.route('/approve').all(verifyToken).post(letterRequestController.approveLetterRequest);

router.route('/reject').all(verifyToken).post(letterRequestController.rejectLetterRequest);

router.route('/reassign').all(verifyToken).post(letterRequestController.reassignLetterRequest);

module.exports = router;
