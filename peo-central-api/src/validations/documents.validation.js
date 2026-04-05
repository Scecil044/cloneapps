const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDocument = {
    body: Joi.object().keys({
        type: Joi.string().allow("", '', null),
        name: Joi.string().allow("", '', null),
        url: Joi.string().allow("", '', null),
        expiry: Joi.string().allow("", '', null),
        identifier: Joi.string().allow("", '', null),
        doc_status: Joi.string().allow("", '', null),
        foreign_id: Joi.custom(objectId),
        module: Joi.string().allow("", '', null),
        created_date: Joi.string().allow("", '', null),
        updated_date: Joi.string().allow("", '', null),
        document_number: Joi.string().allow("", '', null),
        folder_ref: Joi.string().allow("", '', null),
        visa_application_platform: Joi.string().allow("", '', null)
    })
}

const documentById = {
    params: Joi.object().keys({
        documentId: Joi.required().custom(objectId),
    })
}

const documentByforeignId = {
    params: Joi.object().keys({
        foreignId: Joi.required().custom(objectId),
    })
}

const updateDocumentOnId = {
    params: Joi.object().keys({
        documentId: Joi.required().custom(objectId),
    }),
    body: Joi.object().keys({
        type: Joi.string(),
        name: Joi.string(),
        url: Joi.string(),
        expiry: Joi.string(),
        identifier: Joi.string(),
        doc_status: Joi.string(),
        foreign_id: Joi.custom(objectId),
        updated_date: Joi.string(),
        module: Joi.string(),
        document_number: Joi.string(),
        // folder_ref: Joi.string(),
        visa_application_platform: Joi.string()
    }).min(1),
}

const getAll = {
    query: Joi.object().keys({
        type: Joi.string(),
        name: Joi.string(),
        url: Joi.string(),
        expiry: Joi.string(),
        identifier: Joi.string(),
        doc_status: Joi.string(),
        foreign_id: Joi.custom(objectId),
        created_date: Joi.string(),
        updated_date: Joi.string(),
        module: Joi.string(),
        timestamps: true
    })
}

module.exports = {
    createDocument,
    documentById,
    documentByforeignId,
    updateDocumentOnId,
    getAll
}