const Joi = require('joi');
const { objectId } = require('./custom.validation')

const createCreditNote = {
    body: Joi.object().keys({
        invoice_number: Joi.string().optional(), // Optional for custom credit notes
        reason: Joi.string().optional(), // Optional for custom credit notes
        sub_total: Joi.number().required(),
        vat_total: Joi.number().required(),
        invoice_id: Joi.custom(objectId).when('type', {
            is: 'custom',
            then: Joi.optional(), // Optional for custom credit notes
            otherwise: Joi.required() // Required for standard credit notes
        }),
        type: Joi.string().valid('standard', 'custom').default('standard'),
        customer: Joi.custom(objectId).required(),
        company: Joi.custom(objectId).required(),
        total_credit_amount: Joi.number().when('type', {
            is: 'custom',
            then: Joi.number().required(), // Allow negative values for custom (no min)
            otherwise: Joi.number().min(1).required() // Standard must be positive
        }),
        items: Joi.array().required(),
        // Currency fields for multi-currency support (optional for backward compatibility)
        currency: Joi.string().valid('AED', 'USD', 'EUR').optional().allow('', null),
        conversion_rate: Joi.number().min(0).optional().allow(null),
        base_currency: Joi.string().valid('AED').optional().allow(null),
        converted_amount_aed: Joi.number().optional().allow(null), // Can be negative for custom
    }),
};

const deleteCreditNote = {

}

const findCreditNoteById = {
    params:Joi.object().keys({
        creditNoteId: Joi.custom(objectId).required()
    }),
};

const applyCredit = {
    params:Joi.object().keys({
        creditNoteId: Joi.custom(objectId).required()
    }),
    body: Joi.object().keys({
        amountToApply: Joi.number().required().messages({
            'any.required': 'Amount to apply is required',
            'number.base': 'Amount to apply must be a number',
            'number.min': 'Amount to apply must be at least 0'
        }),
        applicationDate: Joi.date().optional(),
        notes: Joi.string().optional().allow(''),
    }),
};

const unapplyCredit = {
    body: Joi.object().keys({
        creditNoteId: Joi.custom(objectId).required().messages({
            'any.required': 'Credit note ID is required',
            'string.base': 'Credit note ID must be a string'
        }),
        invoiceId: Joi.custom(objectId).required().messages({
            'any.required': 'Invoice ID is required',
            'string.base': 'Invoice ID must be a string'
        }),
        reversalReason: Joi.string().optional().allow('').messages({
            'string.base': 'Reversal reason must be a string'
        }),
    }),
};

const updateCreditNote = {
    params: Joi.object().keys({
        creditNoteId: Joi.custom(objectId).required(),
    }),
    body:Joi.object().keys({
        type: Joi.string().valid('standard', 'custom').optional(),
        invoice_id: Joi.string().custom(objectId).optional(),
        customer: Joi.string().custom(objectId),
        company: Joi.string().custom(objectId),
        credit_date: Joi.date().iso(),
        reason: Joi.string(),
        status: Joi.string().valid('Available', 'Partially Applied', 'Fully Applied', 'Expired', 'Cancelled', 'Unapproved'),
        items: Joi.array(),
        sub_total: Joi.number().when('type', {
            is: 'custom',
            then: Joi.number().messages({
                'any.required': 'Sub total is required',
                'number.base': 'Sub total must be a number',
            }), // Allow negative for custom
            otherwise: Joi.number().positive().messages({
                'any.required': 'Sub total is required',
                'number.base': 'Sub total must be a number',
                'number.min': 'Sub total must be at least 0'
            })
        }),
        vat_total: Joi.number().when('type', {
            is: 'custom',
            then: Joi.number(), // Allow negative for custom
            otherwise: Joi.number().min(0)
        }),
        total_credit_amount: Joi.number().when('type', {
            is: 'custom',
            then: Joi.number(), // Allow negative for custom
            otherwise: Joi.number().positive()
        }),
        total: Joi.number().when('type', {
            is: 'custom',
            then: Joi.number(), // Allow negative for custom
            otherwise: Joi.number().positive()
        }),
        applied_to_balance: Joi.number().min(0),
        is_deleted: Joi.boolean(),
    }).min(1)
}

const getCreditNotePdfPreview = {
    params:Joi.object().keys({
        creditNoteId: Joi.custom(objectId).required()
    }),
};

const filterCreditNotesByStatus = {
    body: Joi.object().keys({
      status: Joi.array()
        .items(
          Joi.string()
            .valid('available', 'used', 'void', 'overdue', 'due')
            .messages({
              'any.only': 'Invalid status. Allowed values are: available, used, void, overdue, and due.'
            })
        )
        .required('Status is required.')
        .messages({
          'array.base': 'Status should be an array.',
          'any.required': 'Status is a required field.'
        })
    })
  };

module.exports = {
    createCreditNote,
    deleteCreditNote,
    findCreditNoteById,
    applyCredit,
    unapplyCredit,
    updateCreditNote,
    getCreditNotePdfPreview,
    filterCreditNotesByStatus
}
