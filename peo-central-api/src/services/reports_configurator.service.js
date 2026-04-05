
const config = require("../config/config")
const axios = require('axios');
const getReportToken = async () => {
  console.log(
    "Getting token for report microservice",
    config.report_microservice
  );

  try {
    const { data } = await axios.post(
      `${config.report_microservice.url}/login`,
      {
        email: config.report_microservice.username,
        password: config.report_microservice.password,
      }
    );
    console.log("Token received for report microservice", data.token);
    return data.token;
  } catch (error) {
    console.error("Error getting token:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up the request:", error.message);
    }

    throw error; // Re-throw the error so it's not silently ignored
  }
};

module.exports = {
  getReportToken,
};
