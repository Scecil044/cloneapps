const express = require('express');
const router = express.Router();
const validateToken = require('../../../utils').validateAccessToken;
const { reportsConfiguratorController } = require('../../controllers');

router.get(
  "/report/token",
  validateToken,
  reportsConfiguratorController.getReportToken
);


module.exports = router;
