const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createInvoiceInput = {
  body: Joi.object().keys({
    company_id: Joi.string().custom(objectId).required(),
    input_month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
    items: Joi.array().items(
      Joi.object().keys({
        _id: Joi.string().custom(objectId),
        user_id: Joi.string().custom(objectId).required(), // Required user_id
        service_name: Joi.string().required(),
        description: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        amount: Joi.number().min(0).required(),
        total_amount: Joi.number().min(0),
        receipts: Joi.array().items(
          Joi.object().keys({
            _id: Joi.string().custom(objectId),
            filename: Joi.string().required(),
            file_url: Joi.string().uri().required(),
            name: Joi.string().allow(''),
            size: Joi.number().min(0),
            type: Joi.string().allow('')
          })
        )
      })
    ).min(1).required(),
    status: Joi.string().valid('draft', 'pending', 'approved', 'rejected', 'paid').default('draft'),
    notes: Joi.string().allow('')
  })
};

const getInvoiceInputs = {
  query: Joi.object().keys({
    company_id: Joi.string().custom(objectId),
    status: Joi.string().valid('draft', 'pending', 'approved', 'rejected', 'paid'),
    input_month: Joi.string().pattern(/^\d{4}-\d{2}$/),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getInvoiceInput = {
  params: Joi.object().keys({
    invoiceInputId: Joi.string().custom(objectId)
  })
};

const updateInvoiceInput = {
  params: Joi.object().keys({
    invoiceInputId: Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    company_id: Joi.string().custom(objectId),
    input_month: Joi.string().pattern(/^\d{4}-\d{2}$/),
    items: Joi.array().items(
      Joi.object().keys({
        _id: Joi.string().custom(objectId),
        user_id: Joi.string().custom(objectId).required(), // Required user_id
        service_name: Joi.string().required(),
        description: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        amount: Joi.number().min(0).required(),
        total_amount: Joi.number().min(0),
        receipts: Joi.array().items(
          Joi.object().keys({
            _id: Joi.string().custom(objectId),
            filename: Joi.string().required(),
            file_url: Joi.string().uri().required(),
            name: Joi.string().allow(''),
            size: Joi.number().min(0),
            type: Joi.string().allow('')
          })
        )
      })
    ).min(1),
    status: Joi.string().valid('draft', 'pending', 'approved', 'rejected', 'paid'),
    notes: Joi.string().allow('')
  }).min(1)
};

const deleteInvoiceInput = {
  params: Joi.object().keys({
    invoiceInputId: Joi.string().custom(objectId)
  })
};

const getInvoiceInputsByCompany = {
  params: Joi.object().keys({
    companyId: Joi.string().custom(objectId)
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const updateInvoiceStatus = {
  params: Joi.object().keys({
    invoiceInputId: Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('draft', 'pending', 'approved', 'rejected', 'paid').required()
  })
};

const addReceipt = {
  params: Joi.object().keys({
    invoiceInputId: Joi.string().custom(objectId),
    itemId: Joi.string().custom(objectId)
  }),
  body: Joi.object().keys({
    filename: Joi.string().required(),
    file_url: Joi.string().uri().required()
  })
};

const removeReceipt = {
  params: Joi.object().keys({
    invoiceInputId: Joi.string().custom(objectId),
    itemId: Joi.string().custom(objectId),
    receiptId: Joi.string().custom(objectId)
  })
};

const getInvoiceInputsStats = {
  params: Joi.object().keys({
    companyId: Joi.string().custom(objectId)
  })
};

module.exports = {
  createInvoiceInput,
  getInvoiceInputs,
  getInvoiceInput,
  updateInvoiceInput,
  deleteInvoiceInput,
  getInvoiceInputsByCompany,
  updateInvoiceStatus,
  addReceipt,
  removeReceipt,
  getInvoiceInputsStats
};
