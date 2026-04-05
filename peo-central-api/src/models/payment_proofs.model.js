const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');

const paymentProofsSchema = new mongoose.Schema(
  {
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Companies',
      required: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    upload_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'rejected', 'approved'],
      default: 'pending',
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    reviewed_date: {
      type: Date,
    },
    notes: {
      type: String,
    },
    amount_claimed: {
      type: Number,
      required: true,
    },
    payment_reference: {
      type: String,
      required: true,
    },
    payment_date: {
      type: Date,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
    },
    bank_name: {
      type: String,
    },
    bank_charges: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'AED',
    },
    conversion_rate: {
      type: Number,
      default: 1.0,
    },
    converted_amount_aed: {
      type: Number,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: String,
    },
    updated_by: {
      type: String,
    },
    created_date: {
      type: String,
    },
    updated_date: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
paymentProofsSchema.plugin(toJSON);
paymentProofsSchema.plugin(paginate);
paymentProofsSchema.plugin(deletion);

// Add indexes for performance
paymentProofsSchema.index({ invoice_id: 1, is_deleted: 1 }, { background: true });
paymentProofsSchema.index({ customer_id: 1, is_deleted: 1 }, { background: true });
paymentProofsSchema.index({ uploaded_by: 1, is_deleted: 1 }, { background: true });
paymentProofsSchema.index({ status: 1, is_deleted: 1 }, { background: true });
paymentProofsSchema.index({ upload_date: -1 }, { background: true });

// Pre-save middleware to set created_date and updated_date
paymentProofsSchema.pre('save', function (next) {
  const now = new Date().toISOString();
  if (this.isNew) {
    this.created_date = now;
  }
  this.updated_date = now;
  next();
});

// Pre-update middleware to set updated_date
paymentProofsSchema.pre('findOneAndUpdate', function (next) {
  this._update.updated_date = new Date().toISOString();
  next();
});

const PaymentProofs = mongoose.model('PaymentProofs', paymentProofsSchema);

module.exports = PaymentProofs;
