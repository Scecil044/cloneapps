const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createEmail = {
    body: Joi.object().keys({
        name: Joi.string().allow("", '',).required(),
        module: Joi.string().required(),
        content: Joi.string().allow("", '',).required(),
        auto_replace_keys: Joi.array().required(),
        user_input_keys: Joi.array().required(),
        to: Joi.array(),
        cc: Joi.array(),
        subject: Joi.string(),
        visibility: Joi.string().allow("private", "public").default("public")
    })
};

const getEmailTemplateByName = {
    query: Joi.object().keys({
        templateName: Joi.string().required().messages({
            'any.required': 'Template name is required',
            'string.empty': 'Template name is required'
        })
    })
};


module.exports = {
    createEmail,
    getEmailTemplateByName
}