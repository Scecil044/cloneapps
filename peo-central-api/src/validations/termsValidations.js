const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createNewTerm = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        is_fixed: Joi.boolean().allow(null).allow(""),
        days: Joi.number().required(),
        due_day: Joi.number().optional().allow(null).allow(""),
        due_gap: Joi.number().allow(null).allow(""),
    })
}

module.exports = {
    createNewTerm
}