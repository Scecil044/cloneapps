const express = require('express');
// const validate = require('../../middlewares/validate');
const verifyToken = require('../../middlewares/verifyToken');
const { lieuRequestController } = require('../../controllers');

const router = express.Router();

router.route('/new').all(verifyToken).post(lieuRequestController.createLieuRequest);
router.route('/withdraw').all(verifyToken).post(lieuRequestController.withdrawLieuRequest);
router.route('/approve').all(verifyToken).post(lieuRequestController.approveLieuRequest);
router.route('/reject').all(verifyToken).post(lieuRequestController.rejectLieuRequest);
router.route('/reassign').all(verifyToken).post(lieuRequestController.reassignLieuRequest);

module.exports = router;
