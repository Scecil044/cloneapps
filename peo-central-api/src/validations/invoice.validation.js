const Joi = require('joi');
const { objectId } = require('./custom.validation');

const updateInvoice = {
  params: Joi.object().keys({
    invoice_id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    invoice_number: Joi.string().optional(),
    memo: Joi.string().optional(),
    type: Joi.string().optional(),
    customer: Joi.string().custom(objectId).optional(), // Optional ObjectId for customer
    company: Joi.string().custom(objectId).optional(), // Optional ObjectId for company
    cost_center: Joi.string().custom(objectId).optional(), // Optional ObjectId for cost center
    customer_name: Joi.string().optional(),
    customer_address: Joi.string().optional(),
    customer_trn: Joi.number().optional(),
    branch: Joi.string().optional(),
    email: Joi.string().email().optional(),
    billing_address: Joi.string().optional(),
    shipping_address: Joi.string().optional(),
    order_number: Joi.string().optional(),
    terms: Joi.string().custom(objectId).optional(), // Optional ObjectId for terms
    terms_name: Joi.string().optional(),
    due_date: Joi.date().optional(),
    invoice_date: Joi.date().optional(),
    sale_location: Joi.string().optional(),
    sale_person: Joi.string().optional(),
    items: Joi.array().items(Joi.object()).optional(), // Array of items
    details_field: Joi.object().optional(),
    sub_total: Joi.number().optional(),
    vat_total: Joi.number().optional(),
    discount_total: Joi.number().optional(),
    total: Joi.number().optional(),
    partial_amount: Joi.number().optional(),
    status: Joi.string().optional(),
    paid: Joi.boolean().optional(),
    void: Joi.boolean().optional(),
    write_off: Joi.boolean().optional(),
    credit_applied: Joi.boolean().optional(),
    debit_applied: Joi.boolean().optional(),
    debit_notes: Joi.array().items(Joi.object()).optional(),
    credit_amount: Joi.number().optional(),
    void_reason: Joi.string().optional(),
    write_off_reason: Joi.string().optional(),
    is_recurring: Joi.boolean().optional(),
    is_draft: Joi.boolean().optional(),
    recurring_template: Joi.string().custom(objectId).optional(),
    subject: Joi.string().optional(),
    customer_notes: Joi.string().optional(),
    terms_condition: Joi.string().allow(null).optional(),
    documents: Joi.array().items(Joi.object()).optional(),
    balance_due: Joi.number().optional(),
    invoice_path: Joi.array().items(Joi.string()).optional(),
    payment_note_link: Joi.array().items(Joi.string()).optional(),
    cancelled: Joi.number().optional(),
    estimate: Joi.string().custom(objectId).optional(),
    user_id: Joi.string().custom(objectId).optional(),
    is_deleted: Joi.number().optional(),
    assigned_to: Joi.string().custom(objectId).optional(),
  }),
};

const invoiceSchema = Joi.object({
  // id: Joi.string().length(24).hex().required(),
  _id: Joi.string().length(24).hex().required(),
  amount: Joi.number().positive().required(),
  allow_shortfall: Joi.boolean().default(false),
  mark_as_shortfall: Joi.boolean().when('allow_shortfall', {
    is: true,
    then: Joi.boolean().required(),
    otherwise: Joi.forbidden(),
  }),
  shortfall_reason: Joi.string().when('allow_shortfall', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
});
const recordPayment = {
  body: Joi.object().keys({
    customer: Joi.string().custom(objectId).required(),
    invoice: Joi.string().custom(objectId).required(),
    amount: Joi.number().required(),
    invoice_number: Joi.string().required(),
    reference: Joi.string().required(),
    bank_charge: Joi.number().default(0),
    bank_name: Joi.string().allow('').default(''),
    payment_link: Joi.string().allow('').default(''),
    payment_date: Joi.date().required(),
    payment_mode: Joi.string().required(),
    notes: Joi.string().optional().allow(null, ''),
    is_thanks_required: Joi.number().default(1),
    // Currency fields (optional - will be populated from invoice if not provided)
    currency: Joi.string().valid('AED', 'USD', 'EUR').optional().allow('', null),
    conversion_rate: Joi.number().min(0).optional().allow(null),
    base_currency: Joi.string().valid('AED').optional().allow(null),
    converted_amount_aed: Joi.number().min(0).optional().allow(null),
  }),
};

const recordMultipleInvoicePayments = {
  body: Joi.object().keys({
    customer: Joi.string().custom(objectId).required(),
    total_payment_amount: Joi.number().required(),
    payment_date: Joi.date().required(),
    payment_mode: Joi.string().required(),
    reference: Joi.string().required(),
    notes: Joi.string().optional().allow('', null),
    bank_charge: Joi.number().default(0),
    payment_link: Joi.string().allow('').default(''),
    bank_name: Joi.string().allow('').default(''),
    // Currency fields for multi-currency support (optional for backward compatibility)
    currency: Joi.string().valid('AED', 'USD', 'EUR').optional().allow('', null),
    conversion_rate: Joi.number().min(0).optional().allow(null),
    base_currency: Joi.string().valid('AED').optional().allow(null),
    converted_amount_aed: Joi.number().min(0).optional().allow(null),
    is_thanks_required: Joi.number().default(1),
    invoices: Joi.array().items(invoiceSchema),
  }),
};

const updatePayment = {
  body: Joi.object().keys({
    amount: Joi.number().min(0).required(),
    bank_charge: Joi.number().min(0).optional(),
    bank_name: Joi.string().optional().allow(''),
    payment_link: Joi.string().optional().allow(''),
    payment_date: Joi.date().required(),
    payment_mode: Joi.string().required(),
    notes: Joi.string().optional().allow(''),
    reference: Joi.string().required(),
    // Additional fields sent from frontend
    customer: Joi.string().optional().allow('', null),
    invoice: Joi.string().optional().allow('', null),
    invoice_number: Joi.string().optional().allow('', null),
    // Currency fields for multi-currency support (optional for backward compatibility)
    currency: Joi.string().valid('AED', 'USD', 'EUR').optional().allow('', null),
    conversion_rate: Joi.number().min(0).optional().allow(null),
    base_currency: Joi.string().valid('AED').optional().allow(null),
    converted_amount_aed: Joi.number().min(0).optional().allow(null),
  }),
};

const markInvoiceAsVoid = {
  params: Joi.object().keys({
    invoiceId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    void_reason: Joi.string().required().messages({
      'string.base': 'void_reason must be a string',
      'string.empty': 'void_reason cannot be empty',
      'any.required': 'void_reason is required',
    }),
    void: Joi.boolean().required().valid(true).messages({
      'boolean.base': 'void must be a boolean',
      'any.required': 'void is required',
      'any.only': 'void must be true',
    }),
  }),
};
module.exports = {
  updateInvoice,
  recordPayment,
  recordMultipleInvoicePayments,
  updatePayment,
  markInvoiceAsVoid,
};
