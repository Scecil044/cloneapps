const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createIndustry = {
  body: Joi.object().keys({
    industry_name: Joi.string().required().trim().max(100),
  }),
};

const getIndustry = {
  params: Joi.object().keys({
    industryId: Joi.string().custom(objectId).required(),
  }),
};

const updateIndustry = {
  params: Joi.object().keys({
    industryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    industry_name: Joi.string().trim().max(100),
  }).min(1),
};

const deleteIndustry = {
  params: Joi.object().keys({
    industryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createIndustry,
  getIndustry,
  updateIndustry,
  deleteIndustry,
};
