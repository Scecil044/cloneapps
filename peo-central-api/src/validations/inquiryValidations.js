const Joi = require('joi');
const { objectId } = require('./custom.validation');

const assignPro = {
    body: Joi.object().keys({
        inquiryID: Joi.string().required().custom(objectId).messages({
            "any.required": "Inquiry ID is required",
            "string.empty": "Inquiry ID cannot be empty",
            "string.base": "Inquiry ID must be a string",
            "string.pattern.base": "Inquiry ID must be a valid ObjectId"
        }),
        proID: Joi.string().required().custom(objectId).messages({
            "any.required": "Pro ID is required",
            "string.empty": "Pro ID cannot be empty",
            "string.base": "Pro ID must be a string",
            "string.pattern.base": "Pro ID must be a valid ObjectId"
        }),
    }),
}

const reassignInquiry = {
    body: Joi.object().keys({
        inquiryID: Joi.string().required().custom(objectId).messages({
            "any.required": "Inquiry ID is required",
            "string.empty": "Inquiry ID cannot be empty",
            "string.base": "Inquiry ID must be a string",
            "string.pattern.base": "Inquiry ID must be a valid ObjectId"
        }),
        reassignTo: Joi.string().required().custom(objectId).messages({
            "any.required": "Assign to ID is required",
            "string.empty": "Assign to ID cannot be empty",
            "string.base": "Assign to ID must be a string",
            "string.pattern.base": "Assign to ID must be a valid ObjectId"
        }),
    }),
}

module.exports = {
    assignPro,
    reassignInquiry
}