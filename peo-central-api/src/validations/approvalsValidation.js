const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createApproval = {
  body: Joi.object().keys({
    user_id: Joi.string(),
    module: Joi.string(),
    approvers: Joi.object(),
    required_approvers: Joi.object(),
    date_created: Joi.string(),
    appliction_log: Joi.array(),
    deleted: Joi.boolean(),
    dateUpdated: Joi.string(),
    updatedBy: Joi.string()
  })
};

const updateApprovals = {
  params: Joi.object().keys({
    approvalId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    user_id: Joi.string(),
    module: Joi.string(),
    approvers: Joi.object(),
    required_approvers: Joi.object(),
    date_created: Joi.string(),
    appliction_log: Joi.array(),
    deleted: Joi.boolean(),
    dateUpdated: Joi.string(),
    updatedBy: Joi.string()
  })
};
const getApprovalsOnId = {
  params: Joi.object().keys({
    approvalId: Joi.required().custom(objectId)
  }),
}
const createApprovals = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    modules: Joi.array().items(Joi.string()),
    approvers: Joi.object(),
    required_approvers: Joi.object()
  })
};

const deleteApprovalsOnId = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  })
};

module.exports = {
  createApproval,
  updateApprovals,
  createApprovals,
  deleteApprovalsOnId,
  getApprovalsOnId
};
