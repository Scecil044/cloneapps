const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { exchangeRateService } = require('../services');

/**
 * ================================================================================================
 * Exchange Rate Controller
 * Handles API endpoints for exchange rate operations
 * ================================================================================================
 */

/**
 * Get latest exchange rates
 */
const getLatestExchangeRates = async (req, res) => {
  try {
    const exchangeRates = await exchangeRateService.getLatestExchangeRates();

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Latest exchange rates retrieved successfully',
      data: exchangeRates
    });
  } catch (error) {
    console.error('Error getting latest exchange rates:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get latest exchange rates',
      error: error.message
    });
  }
};

/**
 * Get exchange rates by date
 */
const getExchangeRatesByDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Date parameter is required');
    }

    const exchangeRates = await exchangeRateService.getExchangeRatesByDate(date);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Exchange rates retrieved successfully',
      data: exchangeRates
    });
  } catch (error) {
    console.error('Error getting exchange rates by date:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get exchange rates by date',
        error: error.message
      });
    }
  }
};

/**
 * Get exchange rate history
 */
const getExchangeRateHistory = async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const history = await exchangeRateService.getExchangeRateHistory(parseInt(limit));

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Exchange rate history retrieved successfully',
      data: history
    });
  } catch (error) {
    console.error('Error getting exchange rate history:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get exchange rate history',
      error: error.message
    });
  }
};

/**
 * Manually fetch exchange rates
 */
const manualFetchExchangeRates = async (req, res) => {
  try {
    const result = await exchangeRateService.manualExchangeRateFetch();

    if (result.success) {
      res.status(httpStatus.OK).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error manually fetching exchange rates:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to manually fetch exchange rates',
      error: error.message
    });
  }
};

module.exports = {
  getLatestExchangeRates,
  getExchangeRatesByDate,
  getExchangeRateHistory,
  manualFetchExchangeRates
};
