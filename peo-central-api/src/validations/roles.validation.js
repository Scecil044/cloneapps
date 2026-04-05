const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createRole = {
    body: Joi.object().keys({
        role_name: Joi.string().required(),
        hierarchy: Joi.string().required(),
        permissions: Joi.array().required(),
        created_date: Joi.string(),
        updated_date: Joi.string()
    })
}

const updateRole = {
    params: Joi.object().keys({
        roleId: Joi.required().custom(objectId),
    }),
    body: Joi.object().keys({
        role_name: Joi.string().required(),
        hierarchy: Joi.string().required(),
        permissions: Joi.array().required(),
        created_by: Joi.string(),
        updated_by: Joi.string(),
        updated_date: Joi.string()
    })
}

const getAllRoles = {
    query: Joi.object().keys({
        role_name: Joi.string(),
        hierarchy: Joi.string(),
        permissions: Joi.array(),
        created_by: Joi.string(),
        updated_by: Joi.string(),
        created_date: Joi.string(),
        updated_date: Joi.string(),
        timestamps: true
    })
}

const roleById = {
    params: Joi.object().keys({
        roleId: Joi.required().custom(objectId),
    })
}

module.exports={
    createRole,
    updateRole,
    roleById,
    getAllRoles
}