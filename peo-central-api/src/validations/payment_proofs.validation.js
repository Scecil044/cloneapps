const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPaymentProof = {
  body: Joi.object().keys({
    invoice_id: Joi.required().custom(objectId),
    customer_id: Joi.required().custom(objectId),
    uploaded_by: Joi.required().custom(objectId),
    file_path: Joi.string().required(),
    file_name: Joi.string().required(),
    file_size: Joi.number().required().min(1),
    mime_type: Joi.string().required(),
    amount_claimed: Joi.number().required().min(0),
    payment_reference: Joi.string().required().min(3).max(50),
    payment_date: Joi.date().required(),
    payment_method: Joi.string().required(),
    bank_name: Joi.string().allow('', null),
    bank_charges: Joi.number().min(0).default(0),
    currency: Joi.string().default('AED'),
    conversion_rate: Joi.number().min(0).default(1.0),
    converted_amount_aed: Joi.number().required().min(0),
    notes: Joi.string().allow('', null),
  }),
};

const updatePaymentProof = {
  params: Joi.object().keys({
    paymentProofId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'reviewed', 'rejected', 'approved'),
    notes: Joi.string().allow('', null),
    reviewed_by: Joi.custom(objectId),
    reviewed_date: Joi.date(),
  }).min(1),
};

const getPaymentProof = {
  params: Joi.object().keys({
    paymentProofId: Joi.required().custom(objectId),
  }),
};

const deletePaymentProof = {
  params: Joi.object().keys({
    paymentProofId: Joi.required().custom(objectId),
  }),
};

const getPaymentProofsByInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.required().custom(objectId),
  }),
  query: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
  }),
};

const getPaymentProofsByCustomer = {
  params: Joi.object().keys({
    customerId: Joi.required().custom(objectId),
  }),
  query: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
  }),
};

const getPaymentProofsByStatus = {
  params: Joi.object().keys({
    status: Joi.string().valid('pending', 'reviewed', 'rejected', 'approved').required(),
  }),
  query: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
  }),
};

const getAllPaymentProofs = {
  query: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    sortBy: Joi.string(),
    search: Joi.string(),
    status: Joi.string().valid('pending', 'reviewed', 'rejected', 'approved'),
    customer_id: Joi.custom(objectId),
    start_date: Joi.date(),
    end_date: Joi.date(),
  }),
};

const reviewPaymentProof = {
  params: Joi.object().keys({
    paymentProofId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('reviewed', 'rejected', 'approved').required(),
    notes: Joi.string().allow('', null),
  }),
};

const getPaymentProofStats = {
  query: Joi.object().keys({
    customer_id: Joi.custom(objectId),
  }),
};

module.exports = {
  createPaymentProof,
  updatePaymentProof,
  getPaymentProof,
  deletePaymentProof,
  getPaymentProofsByInvoice,
  getPaymentProofsByCustomer,
  getPaymentProofsByStatus,
  getAllPaymentProofs,
  reviewPaymentProof,
  getPaymentProofStats,
};
