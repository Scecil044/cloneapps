const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const invoiceAllocationsSchema = new mongoose.Schema({
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'invoice'
  },
  invoice_number: {
    type: String,
    required: true
  },
  is_shortfall: {
    type: Boolean,
    default: false
  },
  shortfall_amount: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    default: 0,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Partially Paid', 'Shortfall']
  },
  balance_due_before: {
    type: Number // To track what the balance was before this payment
  },
  partial_amount_before: {
    type: Number // To track what was already settled before this payment
  },
  partial_amount_after: {
    type: Number // To track total settled after this payment
  }
});

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      type: ObjectId,
      required: true,
    },
    invoice: {
      type: ObjectId,
    },
    debit_note: {
      type: ObjectId,
    },
    bill: {
      type: ObjectId,
    },
    amount: {
      type: Number,
      required: true,
    },
    bank_charge: {
      type: Number,
    },
    payment_date: {
      type: Date,
      required: true,
    },
    payment_mode: {
      type: String,
      required: true,
    },
    deposit_to: {
      type: ObjectId,
      required: true,
    },
    reference: {
      type: String,
    },
    notes: {
      type: String,
    },
    documents: {
      type: Array,
    },
    is_thanks_required: {
      type: Boolean,
      required: true,
    },
    is_thanks_sent: {
      type: Boolean,
    },
    isInvoice: {
      type: Boolean,
    },
    isBulkInvoice: {
      type: Boolean,
    },
    isDebitNote: {
      type: Boolean,
    },
    isBill: {
      type: Boolean,
    },
    payment_note_link: {
      type: Array,
    },
    payment_number: {
      type: String,
      required: true,
    },
    bulk_invoices: {
      type: Array,
    },
    is_deleted: {
      type: Number,
      default: 0,
    },
    is_multi_invoice: {
      type: Boolean,
      default: false,
    },
    invoice_allocations: [invoiceAllocationsSchema],
    // Additional fields for multi-invoice payments
    total_allocated: {
      type: Number, // Sum of all allocation amounts
    },
    shortfall_invoices_count: {
      type: Number,
      default: 0,
    },
    // Payment reversal fields
    is_reversed: {
      type: Boolean,
      default: false,
    },
    reversed_at: {
      type: Date,
    },
    reversed_by: {
      type: ObjectId,
      ref: 'users',
    },
    reversal_reason: {
      type: String,
    },
    company: {
      type: ObjectId,
      required: true,
    },
    user_id: {
      type: ObjectId,
      required: false,
    },
    bank_name: {
      type: String,
      default: '',
    },
    payment_link: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      enum: ['AED', 'USD', 'EUR'],
      default: 'AED',
    },
    conversion_rate: {
      type: Number,
      default: 1.0, // 1.0 for AED, actual rate for other currencies
    },
    base_currency: {
      type: String,
      default: 'AED', // Always AED as base currency
    },
    converted_amount_aed: {
      type: Number, // Amount converted to AED for reporting
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('payment', paymentSchema);
