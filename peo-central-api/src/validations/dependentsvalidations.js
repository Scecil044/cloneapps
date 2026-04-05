const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createNewDependent = {
    body: Joi.object().keys({
        first_name: Joi.string().required(),
        middle_name: Joi.string().allow('').optional(),
        last_name: Joi.string().required(),
        principal_id: Joi.string().required(),
        email: Joi.string().email().optional(),
        image_url: Joi.string().uri().optional(),
        relation_to_principal: Joi.string().required(),
        documents: Joi.object().optional(),
        personal: Joi.object().keys({
            address: Joi.string().allow('').optional(),
            gender: Joi.string().valid('Male', 'Female', 'Other').required(),
            phone: Joi.string().allow('').optional(),
            designation: Joi.string().allow('').optional(),
            marital_status: Joi.string().allow('').optional(),
            nationality: Joi.string().allow('').optional(),
            dob: Joi.string().required(),
            cost_center: Joi.string().allow('').optional()
        }).optional(),
        attachments: Joi.array().items(Joi.string().uri()).optional()
    })
};

const updateDependent = {
    params: Joi.object().keys({
        dependentId: Joi.custom(objectId).required()
    }),
    body: Joi.object().keys({
        first_name: Joi.string().optional(),
        middle_name: Joi.string().allow('').optional(),
        last_name: Joi.string().optional(),
        principal_id: Joi.string().optional(),
        email: Joi.string().email().optional(),
        image_url: Joi.string().uri().optional(),
        relation_to_principal: Joi.string().optional(),
        documents: Joi.object().optional(),
        personal: Joi.object().keys({
            address: Joi.string().allow('').optional(),
            gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
            phone: Joi.string().allow('').optional(),
            designation: Joi.string().allow('').optional(),
            marital_status: Joi.string().allow('').optional(),
            nationality: Joi.string().allow('').optional(),
            dob: Joi.string().optional(),
            cost_center: Joi.string().allow('').optional()
        }).optional(),
        attachments: Joi.array().items(Joi.string().uri()).optional()
    })
};

const deleteDependent = {
    params: Joi.object().keys({
        dependentId: Joi.custom(objectId).required()
    }),
    body: Joi.object().keys({
        reason_for_deletion: Joi.string().optional()
    })
};

module.exports = {
    createNewDependent,
    updateDependent,
    deleteDependent
};
