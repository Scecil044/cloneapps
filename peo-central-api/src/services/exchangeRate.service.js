const cron = require('node-cron');
const { ExchangeRate } = require('../models');
const { getExchangeRates } = require('../helpers/currency_conversion_helper');

/**
 * ================================================================================================
 * Exchange Rate Service
 * Handles fetching and storing exchange rates from external API
 * ================================================================================================
 */

/**
 * Fetch exchange rates from API and save to database
 */
const fetchAndSaveExchangeRates = async () => {
  try {
    // Get current exchange rates from API
    const exchangeRates = await getExchangeRates();

    // Check if rates for today already exist
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRate = await ExchangeRate.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
      },
      is_deleted: false,
    });

    if (existingRate) {
      return {
        success: true,
        message: 'Exchange rates for today already exist',
        data: existingRate,
      };
    }

    // Create new exchange rate record
    const newExchangeRate = new ExchangeRate({
      base: 'AED',
      rates: {
        USD: exchangeRates.USD,
        EUR: exchangeRates.EUR,
        AED: exchangeRates.AED,
      },
      date: new Date(exchangeRates.date),
    });

    const savedRate = await newExchangeRate.save();

    return {
      success: true,
      message: 'Exchange rates saved successfully',
      data: savedRate,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get latest exchange rates from database
 */
const getLatestExchangeRates = async () => {
  try {
    const latestRate = await ExchangeRate.findOne({
      is_deleted: false,
    }).sort({ date: -1 });

    if (!latestRate) {
      // If no rates in database, fetch from API
      return await getExchangeRates();
    }

    return {
      USD: latestRate.rates.USD,
      EUR: latestRate.rates.EUR,
      AED: latestRate.rates.AED,
      date: latestRate.date,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get exchange rates for a specific date
 */
const getExchangeRatesByDate = async (date) => {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const exchangeRate = await ExchangeRate.findOne({
      date: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
      is_deleted: false,
    });

    if (!exchangeRate) {
      throw new Error(`No exchange rates found for date: ${date}`);
    }

    return {
      USD: exchangeRate.rates.USD,
      EUR: exchangeRate.rates.EUR,
      AED: exchangeRate.rates.AED,
      date: exchangeRate.date,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get exchange rate history
 */
const getExchangeRateHistory = async (limit = 30) => {
  try {
    const history = await ExchangeRate.find({
      is_deleted: false,
    })
      .sort({ date: -1 })
      .limit(limit);

    return history.map((rate) => ({
      date: rate.date,
      USD: rate.rates.USD,
      EUR: rate.rates.EUR,
      AED: rate.rates.AED,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * ================================================================================================
 * Scheduled Exchange Rate Fetching
 * Runs daily at 6:00 AM UTC to fetch and store exchange rates
 * ================================================================================================
 */
const setupScheduledExchangeRateFetch = () => {
  // Schedule daily exchange rate fetch (runs at 6:00 AM UTC)
  cron.schedule(
    '0 0 * * *',
    // '*/5 * * * *',
    async () => {
      try {
        console.log("==================================================> fetching exchange rates ================")
        await fetchAndSaveExchangeRates();
        console.log("==================================================> completed fetching exchange rates ================")

      } catch (error) {
        // Error handling is done in the function
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Dubai', // UAE timezone
    }
  );
  console.log("Scheduled fetch for exchange rates set up successfully")
};

/**
 * ================================================================================================
 * Manual Exchange Rate Fetch
 * For immediate fetching when needed
 * ================================================================================================
 */
const manualExchangeRateFetch = async () => {
  try {
    const result = await fetchAndSaveExchangeRates();

    return {
      success: true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch exchange rates',
      error: error.message,
    };
  }
};

// Initialize scheduled tasks when the service is loaded
setupScheduledExchangeRateFetch();

module.exports = {
  fetchAndSaveExchangeRates,
  getLatestExchangeRates,
  getExchangeRatesByDate,
  getExchangeRateHistory,
  manualExchangeRateFetch,
  setupScheduledExchangeRateFetch,
};
