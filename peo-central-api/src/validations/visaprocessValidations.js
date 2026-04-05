const Joi = require('joi');
const { objectId } = require('./custom.validation');

const markAsUbsuccessful ={
    body: Joi.object().keys({
        reason_for_unsuccessful: Joi.string().required().messages({
            'any.required': 'Reason for unsuccessful is required',
            'string.empty': 'Reason for unsuccessful is required'
        }),
        visa_id: Joi.string().required().custom(objectId).messages({
            'any.required': 'Visa Id is required',
            'string.empty': 'Visa Id is required'
        }),
        process_type: Joi.string().required().messages({
            'any.required': 'Process type is required',
            'string.empty': 'Process type is required'
        })
    })
}

module.exports = {
    markAsUbsuccessful
}