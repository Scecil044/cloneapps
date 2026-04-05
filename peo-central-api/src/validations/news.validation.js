const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createNews = {
  body: Joi.object().keys({
    header_image: Joi.string().required(),
    title: Joi.string().required(),
    company_ID: Joi.string().custom(objectId),
    short_desc: Joi.string().allow(''),
    category: Joi.string().allow(''),
    highlight: Joi.string().allow(''),
    status: Joi.string().default('N'), // .valid('N', 'A') Assuming 'N' and 'A' are valid status codes
    from: Joi.date().optional(),
    to: Joi.date().optional(),
    permanent: Joi.boolean().optional(),
    created_by: Joi.string().optional(),
    updated_by: Joi.string().optional(),
    delete: Joi.boolean().optional(),
    attachments: Joi.array().items(Joi.string()).optional()
  })
};

const updateNewsOnId = {
  params: Joi.object().keys({
    newsId: Joi.string().custom(objectId).required()
  })
};

const deleteApprovalsOnId = {
  params: Joi.object().keys({
    newsId: Joi.string().custom(objectId).required()
  })
};

module.exports = {
  createNews,
  deleteApprovalsOnId,
  updateNewsOnId
};
