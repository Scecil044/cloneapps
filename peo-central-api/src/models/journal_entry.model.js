const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const journalEntrySchema = new mongoose.Schema(
  {
    journal_number: {
      type: String,
      required: true,
    },
    invoice: {
      type: ObjectId,
    },
    company: {
      type: ObjectId,
      required: true,
    },
    journal_date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    documents: {
      type: Array,
    },
    line_items: {
      type: Array,
      required: true,
    },
    branch: {
      type: String,
    },
    reference: {
      type: String,
    },
    isCashBased: {
      type: Boolean,
    },
    isInvoiceRelated: {
      type: Boolean,
      default: false,
    },
    isPaymentRelated: {
      type: Boolean,
      default: false,
    },
    isCreditNoteRelated: {
      type: Boolean,
      default: false,
    },
    isExpenseRelated: {
      type: Boolean,
      default: false,
    },
    isBillRelated: {
      type: Boolean,
      default: false,
    },
    isBillPaymentRelated: {
      type: Boolean,
      default: false,
    },
    isSalesReciptRelated: {
      type: Boolean,
      default: false,
    },
    payment: {
      type: ObjectId,
    },
    credit_note: {
      type: ObjectId,
    },
    status: {
      type: String,
    },
    manual: {
      type: Boolean,
    },
    expense: {
      type: ObjectId,
    },
    bill: {
      type: ObjectId,
    },
    bill_payment: {
      type: ObjectId,
    },
    salesRecipt: {
      type: ObjectId,
    },
    documents: {
      type: Array,
    },
    tax_item: {
      type: Array,
    },
    document_id: {
      type: String,
    },
    document_customer: {
      type: String,
    },
    memo_description:{
      type: String,
    },
    is_deleted: {
      type: Number,
      default: 0,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('journal_entry', journalEntrySchema);
