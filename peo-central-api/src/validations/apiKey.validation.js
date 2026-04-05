const Joi = require('joi');

const generateApiKey = {
  body: Joi.object().keys({
    appName: Joi.string().required().max(100).trim()
  }),
};

const verifyApiKey = {
  body: Joi.object().keys({
    key: Joi.string().required().trim()
  }),
};

module.exports = {
  generateApiKey,
  verifyApiKey,
};
