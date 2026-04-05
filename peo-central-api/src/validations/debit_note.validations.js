const Joi = require('joi');
const { objectId } = require('./custom.validation');

/**
 * Validation schema for finding a debit note by ID
 */
const findDebitNoteById = {
  params: Joi.object().keys({
    debitNoteId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Validation schema for updating a debit note
 */
const updateDebitNote = {
  params: Joi.object().keys({
    debitNoteId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    debit_note_number: Joi.string(),
    debit_date: Joi.date(),
    due_date: Joi.date(),
    customer: Joi.string().custom(objectId),
    invoice: Joi.string().custom(objectId),
    company: Joi.string().custom(objectId),
    items: Joi.array().items(
      Joi.object().keys({
        service_name: Joi.string().required(),
        description: Joi.string().allow('', null),
        quantity: Joi.number().required(),
        rate: Joi.number().required(),
        amount: Joi.number().required(),
        vat_amount: Joi.number().required(),
        vat_percentage: Joi.number().required(),
      })
    ),
    sub_total: Joi.number(),
    vat_total: Joi.number(),
    total: Joi.number(),
    notes: Joi.string().allow('', null),
    status: Joi.string().valid('Draft', 'Unapproved', 'Approved', 'Applied', 'Void', 'Overdue'),
    paid: Joi.boolean(),
    balance_due: Joi.number(),
    // Currency fields for multi-currency support (optional for backward compatibility)
    currency: Joi.string().valid('AED', 'USD', 'EUR').optional().allow('', null),
    conversion_rate: Joi.number().min(0).optional().allow(null),
    base_currency: Joi.string().valid('AED').optional().allow(null),
    converted_amount_aed: Joi.number().min(0).optional().allow(null),
  }),
};

/**
 * Validation schema for filtering debit notes by status
 */
const filterDebitNotesByStatus = {
  body: Joi.object().keys({
    status: Joi.alternatives().try(
      Joi.string().valid('Draft', 'Unapproved', 'Approved', 'Applied', 'Void', 'Overdue'),
      Joi.array().items(Joi.string().valid('Draft', 'Unapproved', 'Approved', 'Applied', 'Void', 'Overdue'))
    ),
    selected_company_id: Joi.string().custom(objectId).allow(null, ''),
  }),
};

/**
 * Validation schema for approving a debit note
 */
const approveDebitNote = {
  body: Joi.object().keys({
    debitNoteId: Joi.string().custom(objectId).required(),
    dueDate: Joi.date().required(),
  }),
};

/**
 * Validation schema for getting debit note PDF preview
 */
const getDebitNotePdfPreview = {
  params: Joi.object().keys({
    debitNoteId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Validation schema for deleting a debit note
 */
const deleteDebitNote = {
  params: Joi.object().keys({
    debitNoteId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Validation schema for unapplying a debit note
 */
const unapplyDebit = {
  body: Joi.object().keys({
    debitNoteId: Joi.string().custom(objectId).required(),
    invoiceId: Joi.string().custom(objectId).required(),
    reversalReason: Joi.string().allow('', null),
  }),
};

module.exports = {
  findDebitNoteById,
  updateDebitNote,
  filterDebitNotesByStatus,
  approveDebitNote,
  getDebitNotePdfPreview,
  deleteDebitNote,
  unapplyDebit,
};
