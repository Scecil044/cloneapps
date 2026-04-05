const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');
const Invoice = require('./invoice.model');

const debitNoteSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'invoice',
      required: true,
    },
    debit_note_number: {
      type: String,
      unique: true,
      required: true,
    },
    currency: {
      type: String,
      enum: ['AED', 'USD', 'EUR'],
      default: 'AED',
    },
    conversion_rate: {
      type: Number,
      default: 1.0,
    },
    base_currency: {
      type: String,
      default: 'AED',
    },
    converted_amount_aed: {
      type: Number,
      default: 0,
    },
    visa_sponsor: {
      type: String,
      enum: ['Dynamic Employment Services', 'Executive Employment Services', 'Other'],
      default: 'Dynamic Employment Services',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Companies',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'accounting_companies',
    },
    customer_name: {
      type: String,
      required: true,
    },
    customer_address: {
      type: String,
    },
    customer_trn: {
      type: Number,
    },
    branch: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    billing_address: {
      type: String,
    },
    shipping_address: {
      type: String,
    },
    order_number: {
      type: String,
    },
    terms: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'terms',
    },
    terms_name: {
      type: String,
      required: true,
    },
    debit_date: {
      type: Date,
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    date_applied: {
      type: Date,
    },
    details_field: {
      type: Object,
    },
    sub_total: {
      type: Number,
      required: true,
    },
    vat_total: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Unapproved', 'Approved', 'Applied', 'Void', 'Overdue'],
      default: 'Draft',
    },
    is_draft: {
      type: Boolean,
      default: true,
    },
    debit_amount: {
      type: Number,
      default: 0,
    },
    applied_amount: {
      type: Number,
      default: 0,
    },
    debit_balance: {
      type: Number,
      default: 0,
    },
    original_invoice_balance: {
      type: Number,
      default: 0,
    },
    application_date: {
      type: Date,
    },
    void_reason: {
      type: String,
    },
    customer_notes: {
      type: String,
    },
    terms_condition: {
      type: String,
      default: null,
    },
    documents: {
      type: Array,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    memo: { type: String, default: '' },
    reason: { type: String, default: '' },
    original_invoice_number: { type: String, default: '' },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    deleted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    approved_at: {
      type: Date,
    },
    voided_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    voided_at: {
      type: Date,
    },
    application_notes: {
      type: String,
    },
    reversal_notes: {
      type: String,
    },
    reversed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    reversed_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

debitNoteSchema.plugin(toJSON);
debitNoteSchema.plugin(paginate);
debitNoteSchema.plugin(deletion);

debitNoteSchema.pre('save', async function (next) {
  try {
    if (this.invoice) {
      // Fetch parent invoice
      const invoice = await Invoice.findById(this.invoice).select('visa_sponsor');

      if (invoice && invoice.visa_sponsor !== undefined) {
        this.visa_sponsor = invoice.visa_sponsor;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * ===============================================================================
 * Post save function to calculate debit balance
 * The function checks debit amount and applied amount and updates debit balance
 * ===============================================================================
 */
debitNoteSchema.post('save', function (doc) {
  const debitBalance = doc.debit_amount - doc.applied_amount;
  if (doc.debit_balance !== debitBalance) {
    // Use updateOne to avoid triggering another save hook
    this.constructor.updateOne({ _id: doc._id }, { debit_balance: debitBalance }).exec();
  }
});

const DebitNote = mongoose.model('DebitNote', debitNoteSchema);
module.exports = DebitNote;
