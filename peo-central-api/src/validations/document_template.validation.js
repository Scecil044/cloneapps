const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDocument = {
    body: Joi.object().keys({
        name: Joi.string().allow("", '',).required(),
        module: Joi.string().required(),
        content: Joi.string().allow("", '',).required(),
        auto_replace_keys: Joi.array().required(),
        user_input_keys: Joi.array().required(),
        condition: Joi.object().keys({
            document_name: Joi.string().allow('', ''),
            name: Joi.string().allow('', ''),
            type: Joi.string().allow('', ''),
            employment_type: Joi.string().allow('', '')
        }).required()
    })
}


module.exports = {
    createDocument,
}