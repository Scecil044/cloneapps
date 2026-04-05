const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const invoiceLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: String
    },
    document_id: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    dataBeforeUpdationOrCreation: {
      type: Object,
    },
    createdOrUpdateData: {
      type: Object,
    },
    updatedFields: {
      type: Object,
    },
    logMessage: {
      type: String
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    created_date: {
      type: String
    },
    updated_date: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

invoiceLogSchema.plugin(toJSON);
invoiceLogSchema.plugin(paginate);
module.exports = mongoose.model('invoice_log', invoiceLogSchema);
