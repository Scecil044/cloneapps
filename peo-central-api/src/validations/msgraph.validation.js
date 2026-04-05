const Joi = require('joi');
const { objectId } = require('./custom.validation');

const fetchMailListing = {
    query: Joi.object().keys({
        skip: Joi.number().default(0),
        limit: Joi.number().default(10)
    })
}

const fetchEmailsByFolder = {
    query: Joi.object().keys({
        skip: Joi.number().default(0),
        limit: Joi.number().default(10),
        folder_id: Joi.string().required()
    })
}

const getMailById = {
    params: Joi.object().keys({
        mail_id: Joi.string().required()
    })
}

const searchMail = {
    query: Joi.object().keys({
        search: Joi.string().allow("",null).required()
    })
}

const sendMail = {
    body: Joi.object().keys({
        recieverAddresses: Joi.array().required().min(1),
        ccAddresses: Joi.array(),
        subject: Joi.string().required(),
        content: Joi.string().required(),
        attachments: Joi.array()
    })
}

const sendreplyToMail = {
    body: Joi.object().keys({
        recieverAddresses: Joi.array().required().min(1),
        content: Joi.string().allow("",null).default(""),
    }),
    params: Joi.object().keys({
        mail_id: Joi.string().not("",null).required()
    })
}

const sendReplyAll = {
    body: Joi.object().keys({
        content: Joi.string().allow("",null).default(""),
    }),
    params: Joi.object().keys({
        mail_id: Joi.string().not("",null).required()
    })
}

const forwardMail = {
    body: Joi.object().keys({
        recieverAddresses: Joi.array().required().min(1),
        content: Joi.string().allow("",null).default(""),
    }),
    params: Joi.object().keys({
        mail_id: Joi.string().not("",null).required()
    })
}

module.exports = {
    fetchMailListing,
    fetchEmailsByFolder,
    getMailById,
    searchMail,
    sendMail,
    sendreplyToMail,
    sendReplyAll,
    forwardMail
}