const msal = require('@azure/msal-node');
const queryString = require("querystring")

const config = {
  auth: {
    clientId: process.env.MSAZURE_CLIENT_ID,
    authority: process.env.MSAZURE_AUTHORITY,
    clientSecret: queryString.escape(process.env.MSAZURE_CLIENT_SECRET)
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    }
  }
};

let msalClient = new msal.ConfidentialClientApplication(config);

module.exports = {
  msalClient
}