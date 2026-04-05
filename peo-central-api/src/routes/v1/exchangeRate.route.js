const express = require('express');
const { exchangeRateController } = require('../../controllers');
const verifyToken = require('../../middlewares/verifyToken');

const router = express.Router();

/**
 * ================================================================================================
 * Exchange Rate Routes
 * ================================================================================================
 */

// Get latest exchange rates
router.route('/latest')
  .get(exchangeRateController.getLatestExchangeRates);

// Get exchange rates by date
router.route('/date/:date')
  .get(exchangeRateController.getExchangeRatesByDate);

// Get exchange rate history
router.route('/history')
  .get(exchangeRateController.getExchangeRateHistory);

// Manually fetch exchange rates (requires authentication)
router.route('/fetch')
  .all(verifyToken)
  .post(exchangeRateController.manualFetchExchangeRates);

module.exports = router;
