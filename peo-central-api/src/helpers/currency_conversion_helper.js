const axios = require("axios");

const getExchangeRates = async () => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/AED');
    return {
      USD: response.data.rates.USD,
      EUR: response.data.rates.EUR,
      AED: 1.0,
      date: response.data.date
    };
  } catch (error) {
    console.error('Exchange rate API error:', error);
    // Fallback to default rates
    return {
      USD: 3.67, // Fallback rate
      EUR: 4.02, // Fallback rate
      AED: 1.0,
      date: new Date().toISOString().split('T')[0]
    };
  }
};

module.exports = {getExchangeRates};