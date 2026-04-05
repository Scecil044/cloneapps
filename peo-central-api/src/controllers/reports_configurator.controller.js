const { reportsConfiguratorService } = require('../services');

const getReportToken = async (req, res) => {
  try {
    console.log("Getting token for report microservice");
    const token = await reportsConfiguratorService.getReportToken();
    console.log("Token received for report microservice", token);
    return res.status(200).json({ token });
  } catch (error) {
    const status = error.response ? error.response.status || error.code : 500;
    const message =
      error.message ||
      (error.response.data && error.response.data.message) ||
      error.response.statusText ||
      "Server side error";
    return res.status(status).json({ error: message, success: false });
  }
};
module.exports = {
  getReportToken
};
