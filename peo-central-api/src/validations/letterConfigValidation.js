const Joi = require('joi');
const { objectId } = require('./custom.validation');

const letterConfigValidate = Joi.object()
  .keys({
    company_ID: Joi.string().custom(objectId).required(),
    letterRequest: Joi.array().optional(),
    letterKeyHint: Joi.array().optional()
  })
  .or('letterRequest', 'letterKeyHint');

module.exports = {
  letterConfigValidate
};
