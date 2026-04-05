const Joi = require('joi');
const { objectId } = require('./custom.validation');

const updateRenewal = {
    params: Joi.object().keys({
        renewalsId: Joi.required().custom(objectId),
    }),
    body: Joi.object().keys({
        user_id: Joi.custom(objectId),
        company_id: Joi.custom(objectId),
        processes: Joi.array(),
        process_type: Joi.string(),
        created_by: Joi.string(),
        updated_by: Joi.string(),
        create_work_order: Joi.object(),
        create_invoice: Joi.object(),
        record_payments: Joi.object(),
        attachments: Joi.array(),
        status: Joi.string(),
        comments: Joi.array(),
        is_deleted: Joi.boolean(),
        created_date: Joi.string(),
        updated_date: Joi.string()
    })
}

module.exports = {
    updateRenewal
}