const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');

const payrollManagementSchema = new mongoose.Schema(
  {
    user_id: mongoose.Schema.Types.ObjectId,
    invoice_id: mongoose.Schema.Types.ObjectId,
    invoice_transaction_id: mongoose.Schema.Types.ObjectId,
    employee_no: String,
    invoice_number: String,
    status: String,
    payout_status: String,
    selectedBankDetails: Object,
    currency: String,
    payout_method: String,
    net_payout: Number,
    payment: Array,
    payroll_initiated_date: Date,
    pay_month: String,
    initiate_status: String,
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
    statement_of_account_url:String,
    service_fees_receipt_url:String,
    batch_title: String,
    service_fees_email_sent: { type: Boolean, default: false },
    revert_data:{
      revertPayoutReason: String,
      reverted_by: Object,
      reverted_at: Date,
    },
    is_service_fee_refund: { type: Boolean, default: false },
    calculation_details: Object,
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

module.exports = mongoose.model('payroll_commission', payrollManagementSchema);