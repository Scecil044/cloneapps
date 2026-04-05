const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { toJSON, paginate } = require('./plugins');
const Company = require('./companies.model');

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      required: true
    },
    type: {
      type: String
    },
    customer: {
      type: ObjectId,
      required: true
    },
    company: {
      type: ObjectId,
      required: true
    },
    cost_center: {
      type: ObjectId
    },
    customer_name: {
      type: String,
      required: true
    },
    customer_address: {
      type: String
    },
    customer_trn: {
      type: Number
    },
    branch: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    billing_address: {
      type: String
      // required: true,
    },
    shipping_address: {
      type: String
      //required: true,
    },
    order_number: {
      type: String
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
    terms: {
      type: ObjectId,
      required: true,
      ref: 'terms'
    },
    terms_name: {
      type: String,
      required: true
    },
    due_date: {
      type: Date,
      required: true
    },
    invoice_date: {
      type: Date,
      required: true
    },
    sale_location: {
      type: String
      // required: true,
    },
    sale_person: {
      type: String
    },
    items: {
      type: Array,
      required: true
    },
    details_field: {
      type: Object
    },
    sub_total: {
      type: Number,
      required: true
    },
    totalAdministrationCost: { type: Number },
    vat_total: {
      type: Number,
      required: true
    },
    discount_total: {
      type: Number
    },
    total: {
      type: Number,
      required: true
    },
    partial_amount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Unapproved', 'Due', 'Overdue', 'Paid', 'Partially Paid']
    },
    paid: {
      type: Boolean,
      default: false
    },
    void: {
      type: Boolean,
      default: false
    },
    write_off: {
      type: Boolean,
      default: false
    },
    credit_applied: {
      type: Boolean,
      default: false
    },
    debit_applied: {
      type: Boolean,
      default: false
    },
    debit_amount: {
      type: Number,
      default: 0
    },
    debit_notes: {
      type: Array,
      default: [],
      ref: 'debit_note'
    },
    credit_amount: {
      type: Number,
      default: 0
    },
    credit_notes: [
      {
        type: mongoose.Schema.Types.ObjectId, // Reference to the CreditNote model
        ref: 'CreditNote'
      }
    ],
    is_duplicate:{
      type: Boolean,
      default: false
    },
    parent_invoice:{
      type: mongoose.Schema.Types.ObjectId,
    },
    void_reason: {
      type: String
    },
    voided_by:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    voided_at:{
      type:Date
    },
    write_off_reason: {
      type: String
    },
    is_uploaded:{
      type:Boolean,
      default:false
    },
    uploaded_by:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    uploaded_at:{
      type:Date
    },
    is_recurring: {
      type: Boolean,
      required: true
    },
    is_draft: {
      type: Boolean,
      default: false
    },
    recurring_template: {
      type: ObjectId
    },
    subject: {
      type: String
    },
    customer_notes: {
      type: String
    },
    terms_condition: {
      type: String,
      default: null
    },
    documents: {
      type: Array
    },
    balance_due: {
      type: Number
    },
    // settled_amount:{
    //   type: Number,
    //   default:0
    // },
    invoice_path: {
      type: Array
    },
    payment_note_link: {
      type: Array
    },
    payment_date:{
      type: Date
    },
    cancelled: {
      type: Number,
      default: 0
    },
    estimate: {
      type: ObjectId
    },
    user_id: {
      type: ObjectId
    },
    is_deleted: {
      type: Number,
      default: 0
    },
    time_sheet: {
      type: String
    },
    invoice_link: {
      type: String
    },
    is_sent: {
      type: Object,
      default: {
        // status: false,
        Due: false,
        Overdue: false,
        Paid: false
      }
    },
    sent_date:{
      type: Date
    },
    visa_sponsor: {
      type: String,
      enum: ['Executive Employment Services', 'Dynamic Employment Services'],
      default: 'Dynamic Employment Services'
    },
    memo: { type: String },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    is_individual_invoice: { type: Boolean, default: false },
    /**
     * ==========================================================================
     * Start of added fields to support shortfall payments
     * ==========================================================================
     */
    shortfall_amount: {
      type: Number,
      default: 0
    },
    shortfall_date: {
      type: Date
    },
    shortfall_reason: {
      type: String
    },
    shortfall_approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    /**
     * ==========================================================================
     * End of added fields to support shortfall payments
     * ==========================================================================
     */
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
  },
  {
    timestamps: true
  }
);

invoiceSchema.pre('save', function (next) {
  // Credit notes can reduce balance below zero (negative effect)
  // Only validate that credit_amount is not negative
  if (this.credit_amount < 0) {
    console.log('balance credit amount', this.credit_amount);
    console.log('balance balance due', this.balance_due);
    return next(new Error('Credit amount cannot be negative.'));
  }
  next();
});

invoiceSchema.post('save', async function (doc, next) {
  try {
    const company = await Company.findById(doc.customer);

    if (company && company.email && company.email !== doc.email) {
      doc.email = company.email;
      await doc.save();
    }
    if (company && company.company_name && company.company_name !== doc.customer_name) {
      doc.customer_name = company.company_name;
      await doc.save();
    }
    next();
  } catch (err) {
    console.error('Error updating email:', err);
    next(err);
  }
});

invoiceSchema.pre('save', async function (next) {
  for (let i = 0; i < this.items.length; i++) {
    if (!this.items[i].net_total) {
      const vat = parseFloat(this.items[i].vat_amount || 0);
      const amount = parseFloat(this.items[i].amount || 0);
      this.items[i].net_total = vat + amount;
    }
  }
  next();
});

invoiceSchema.plugin(toJSON);
invoiceSchema.plugin(paginate);

module.exports = mongoose.model('invoice', invoiceSchema);
