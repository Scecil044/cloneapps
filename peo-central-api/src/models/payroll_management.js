const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');

const payrollManagementSchema = new mongoose.Schema(
  {
    user_id: mongoose.Schema.Types.ObjectId,
    invoice_id: mongoose.Schema.Types.ObjectId,
    employee_no: String,
    invoice_number: String,
    status: String,
    deactivate_reason: String,
    payout_status: String,
    pay_month: String,
    is_bulk_uploaded: {
      type: Boolean,
      default: false,
    },
    is_client_invoice: {
      type: Boolean,
      default: false,
    },
    payroll_initiated_date: Date,
    is_custom_invoice: {
      type: Boolean,
      default: false,
    },
    payment: Array,
    process: [
      {
        process_name: String,
        created_at: { type: Date, default: Date.now },
        completed_at: Date,
        completed_by: Object,
        updated_at: Date,
        count: Number,
        status: {
          type: String,
          enum: ['pending', 'Completed', 'Inprogress'],
          default: 'pending',
        },
      },
    ],
    batch_title: String,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

payrollManagementSchema.plugin(toJSON);
payrollManagementSchema.plugin(paginate);
payrollManagementSchema.plugin(deletion);

module.exports = mongoose.model('payroll_management', payrollManagementSchema);