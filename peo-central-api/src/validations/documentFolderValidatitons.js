const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDocumentFolder = {
    body: Joi.object().keys({
        folder_name: Joi.string().required(),
        company_id: Joi.string().custom(objectId).optional().allow("").allow(null),
        files: Joi.array().optional().default([]),
        isClientFolder: Joi.boolean().optional().default(false),
        selected_company_id: Joi.array().custom(objectId).optional().allow("").allow(null)
    })
}

const updateDocumentFolder = {
    params: Joi.object().keys({
        folderId: Joi.required().custom(objectId)
    }),
    body: Joi.object().keys({
        folder_name: Joi.string().required(),
        company_id: Joi.string().custom(objectId).optional().allow(""),
    })
}

const deleteDocumentFolder = {
    params: Joi.object().keys({
        folderId: Joi.required().custom(objectId)
    })
}

module.exports = {
    createDocumentFolder,
    updateDocumentFolder,
    deleteDocumentFolder
}