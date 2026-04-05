const Joi = require('joi');

const wfhconfigValidate = Joi.object().keys({
        company_ID: Joi.string(),
        wfhTypes:Joi.array(),
        wfhConds:Joi.array(),
        wfhAccess: Joi.array()
    })


module.exports = {
    wfhconfigValidate,
}