const mongoose = require('mongoose');
const apm = require('@nathangroup/apm').default;

const payrollprocessSchema = new mongoose.Schema({
  pay_month: {
    type: String,
  },
  payrollRun: {
    type: Array,
  },
  status: {
    type: String,
  },
  approved_by_id: {
    type: String,
  },
  approvals: {
    type: Array,
  },
  hr_approval_id: {
    type: String,
  },
  finance_approval_id: {
    type: String,
  },
  approved_by_finance: {
    type: String,
  },
  approved_by_hr: {
    type: String,
  },
  submit_for_approval: {
    type: String,
  },
  salary: {
    type: Array,
  },
  variance: {
    type: Array,
  },
  jv_cost_center: {
    type: Array,
  },
  history: {
    type: Array,
  },
  compensation: {
    type: Object,
  },
  payitems: {
    type: Array,
  },
  company_id: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  closedDate: {
    type: Date,
  },
  payrollCategory: {
    type: String,
  },
  checkPaidStatusLogs: {
    type: Array,
  },
});

apm.traceCollection(payrollprocessSchema, 'PayrollProcess');

module.exports = mongoose.model('PayrollProcess', payrollprocessSchema);
