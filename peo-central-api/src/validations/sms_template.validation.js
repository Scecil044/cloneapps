const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSMS = {
    body: Joi.object().keys({
        name: Joi.string().allow("", '',).required(),
        module: Joi.string().required(),
        content: Joi.string().allow("", '',).required(),
        auto_replace_keys: Joi.array().required(),
        user_input_keys: Joi.array().required(),
        to: Joi.array(),
        cc: Joi.array(),
        subject: Joi.string(),
    })
}


module.exports = {
    createSMS,
}