const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOnboardings = {
    body: Joi.object().keys({
        comments: Joi.array(),
        status: Joi.string(),
        stage_type: Joi.string(),
        attachments: Joi.array(),
        process_type: Joi.string(),
        processes: Joi.array(),
        employment_contract: Joi.object(),
        create_work_order: Joi.object(),
        create_invoice: Joi.object(),
        record_payments: Joi.object(),
        stage_id: Joi.string(),
        company_id: Joi.string(),
        user_id: Joi.string(),
        created_date: Joi.string(),
        updated_date: Joi.string(),
        // remarks: Joi.string().allow('').optional(),
    })
}

const onboardViaLink = {
    headers: Joi.object().keys({
      authorization: Joi.string()
        .required()
        .messages({
          'string.base': `Authorization must be a type of 'text'`,
          'any.required': `This route is restricted to authorized tokens. No authorization header has been provided for this request!`,
        })
        .custom((value, helpers) => {
          // Validate token format, e.g., "Bearer <token>"
          if (!/^Bearer [a-zA-Z0-9-_.]+$/.test(value)) {
            return helpers.message('Invalid authorization token format. Token must start with "Bearer " followed by a valid token.');
          }
          return value; // If valid, return the value
        }),
    }).unknown(true) // Allow other headers if needed
  };

const updateOnboardings = {
    params: Joi.object().keys({
        onboardingsId: Joi.required().custom(objectId),
    }),
    body: Joi.object().keys({
        comments: Joi.array(),
        status: Joi.string(),
        stage_type: Joi.string(),
        attachments: Joi.array(),
        process_type: Joi.string(),
        processes: Joi.array(),
        employment_contract: Joi.object(),
        create_work_order: Joi.object(),
        create_invoice: Joi.object(),
        record_payments: Joi.object(),
        stage_id: Joi.string(),
        company_id: Joi.string(),
        user_id: Joi.string(),
        created_by: Joi.string(),
        updated_by: Joi.string(),
        updated_date: Joi.string()
    })
}

const onboardingsById = {
    params: Joi.object().keys({
        onboardingsId: Joi.required().custom(objectId),
    })
}

const onboardingsByCompanyId = {
    params: Joi.object().keys({
        companyId: Joi.required().custom(objectId),
    })
}

const onboardingsByUserId = {
    params: Joi.object().keys({
        userId: Joi.required().custom(objectId),
    })
}

const onboardingsByStageId = {
    params: Joi.object().keys({
        stageId: Joi.required().custom(objectId),
    })
}

module.exports = {
    createOnboardings,
    updateOnboardings,
    onboardingsById,
    onboardingsByCompanyId,
    onboardingsByUserId,
    onboardingsByStageId,
    onboardViaLink
}