const { objectId } = require('./custom.validation');
const Joi = require('joi');


const createTaxCode = {
    body: Joi.object().keys({
        isExpense: Joi.string().valid('true','false').allow('').messages({
            'string.base': '"isExpense" should be a type of string',
            // 'string.empty': '"isExpense" cannot be an empty field when provided',
            'any.only': '"isExpense" should be either "true" or "false"'
          }),
        isSales: Joi.string().valid('true','false').allow('').messages({
            'string.base': '"isSales" should be a type of string',
            // 'string.empty': '"isSales" cannot be an empty field when provided',
            'any.only': '"isSales" should be either "true" or "false"'
          }),
        name: Joi.string().required().messages({
            'string.base': '"name" should be a type of string',
            'string.empty': '"name" cannot be an empty field',
            'any.required': '"name" is a required field'
        }),
        rate: Joi.number().required().messages({
            'number.base': '"rate" must be a number',
            'any.required': '"rate" is a required field'
          }),
        code: Joi.string().required().messages({
            'string.base': '"code" should be a type of string',
            'string.empty': '"code" cannot be an empty field',
            'any.required': '"code" is a required field'
        }),
    }),
}

const getTaxCodeById = {
    params:Joi.object().keys({
        taxId: Joi.string().required().custom(objectId)
    })
};

const updateTaxCode = {
    params:Joi.object().keys({
        taxId: Joi.string().custom(objectId)
    }),
    body: Joi.object().keys({
        isExpense: Joi.string().valid('true','false').allow('').messages({
            'string.base': '"isExpense" should be a type of string',
            // 'string.empty': '"isExpense" cannot be an empty field when provided',
            'any.only': '"isExpense" should be either "true" or "false"'
          }),
        isSales: Joi.string().valid('true','false').allow('').messages({
            'string.base': '"isSales" should be a type of string',
            // 'string.empty': '"isSales" cannot be an empty field when provided',
            'any.only': '"isSales" should be either "true" or "false"'
          }),
        name: Joi.string().required().messages({
            'string.base': '"name" should be a type of string',
            'string.empty': '"name" cannot be an empty field',
            'any.required': '"name" is a required field'
        }),
        rate: Joi.number().required().messages({
            'number.base': '"rate" must be a number',
            'any.required': '"rate" is a required field'
          }),
        code: Joi.string().required().messages({
            'string.base': '"code" should be a type of string',
            'string.empty': '"code" cannot be an empty field',
            'any.required': '"code" is a required field'
        }),
    }),

}

const deleteTaxCode = {
    params:Joi.object().keys({
        taxId: Joi.string().required().custom(objectId)
    })
};

module.exports = {
    createTaxCode,
    getTaxCodeById,
    updateTaxCode,
    deleteTaxCode
}