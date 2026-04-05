const Joi = require('joi');

const reversePayment = {
  body: Joi.object().keys({
    reason: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Reversal reason must be at least 10 characters long',
        'string.max': 'Reversal reason cannot exceed 500 characters',
        'any.required': 'Reversal reason is required'
      })
  })
};

module.exports = {
  reversePayment
};
