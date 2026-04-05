const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createLeads = {
    body: Joi.object().keys({
        processes: Joi.array(),
        status: Joi.string(),
        company_id: Joi.string(),
        company_details: Joi.object(),
        created_date: Joi.string(),
        updated_date: Joi.string(),
        user_id: Joi.custom(objectId),
        client_type: Joi.string(),
        service_type: Joi.string(),
        contact_person: Joi.object(),
        lead_details: Joi.object(),
        is_unsuccessful: Joi.boolean(),
        reason_for_unsuccessful: Joi.string(),
        proposal_creation: Joi.object(),
        agreement_creation: Joi.object(),
        unsuccessful_on: Joi.string(),
        lead_name: Joi.string(),
        decision_maker_involvement: Joi.string()
    })
}

const updateLeads = {
    params: Joi.object().keys({
        leadsId: Joi.required().custom(objectId),
    }),
    body: Joi.object().keys({
        processes: Joi.array(),
        status: Joi.string(),
        company_id: Joi.string(),
        created_by: Joi.string(),
        updated_by: Joi.string(),
        updated_date: Joi.string(),
        user_id: Joi.custom(objectId),
        client_type: Joi.string(),
        service_type: Joi.string(),
        contact_person: Joi.object(),
        lead_details: Joi.object(),
        is_unsuccessful: Joi.boolean(),
        reason_for_unsuccessful: Joi.string(),
        proposal_creation: Joi.object(),
        agreement_creation: Joi.object(),
        unsuccessful_on: Joi.string(),
        company_details: Joi.object(),
        lead_name: Joi.string(),
        decision_maker_involvement: Joi.string()
    })
}

const leadsById = {
    params: Joi.object().keys({
        leadsId: Joi.required().custom(objectId),
    })
}

const leadsOnCompanyId = {
    params: Joi.object().keys({
        companyId: Joi.required().custom(objectId),
    })
}

module.exports = {
    createLeads,
    updateLeads,
    leadsById,
    leadsOnCompanyId
}
