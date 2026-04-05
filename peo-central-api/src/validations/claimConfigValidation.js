const Joi = require('joi');

const create = Joi.object({
    company_ID: Joi.string().required(),
    claim_ref_no: Joi.number().required(),
    ClaimSubTypes: Joi.array().required(),
    claimTypes: Joi.array().required(),
    ADD_CLAIMS_PAYROLL: Joi.string().required(),
})

module.exports = { create }
