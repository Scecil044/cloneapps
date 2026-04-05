const Joi = require('joi');
const { objectId } = require('./custom.validation');

const updatePointOfContact = {
    body: Joi.object().keys({
        name: Joi.string().optional(),
        email: Joi.string().email().optional(),
        phone: Joi.string().optional(),
        designation: Joi.string().optional(),
        department: Joi.string().optional(),
        company_id: Joi.string().custom(objectId).optional(),
        status: Joi.string().optional().allow(null),
        image_url: Joi.string().optional().allow(null),
        selected_company_id: Joi.array().allow('', '', null)
    }),
    params: Joi.object().keys({
        pocId: Joi.string().custom(objectId).required()
    })
}
const createNewPointOfContact = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        designation: Joi.string().required(),
        department: Joi.string().required(),
        company_id: Joi.string().custom(objectId).required(),
        status: Joi.string().optional().allow(null),
        image_url: Joi.string().optional().allow(null),
         selected_company_id: Joi.array().allow('', '', null)
    }),
}

module.exports = {
    updatePointOfContact,
    createNewPointOfContact
}