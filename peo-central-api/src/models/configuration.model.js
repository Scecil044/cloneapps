const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const configSchema = new mongoose.Schema(
  {
    modules: {
      type: Array
    },
    module_relations: {
      type: Array
    },
    visa_sponsors: {
      type: Array
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
    },
    costCenterOptions: {
      type: Array,
    },
    bankNameOptions: {
      type: Array,
    },
    fixed: {
      type: Array,
    },
    earning: {
      type: Array,
    },
    deduction: {
      type: Array,
    },
    recurring_earning: {
      type: Array,
    },
    recurring_deduction: {
      type: Array,
    },
    payitem_approver: {
      type: Array,
    },
    salarySheetApprover: {
      type: Array,
    },
    salary_sheet_closing_date: {
      type: String
    },
    recursiveRequestApprovals: {
      type: Array
    },
    SYSTEM_EMAIL_ID: {
      type: String
    },
    PAYROLL_BASE_URL: {
      type: String
    },
    HOME_URL: {
      type: String
    },
    PAYSLIP_DOWNLOAD_BASE_URL: {
      type: String
    },
    INCLUDE_ATTENDANCE: {
      type: Boolean
    },
    IS_WORKING_DAYS_TYPE: {
      type: Boolean
    },
    WEEKEND_DAYS: {
      type: Array
    },
    FINANCIAL_START_MONTH: {
      type: Number
    },
    ADD_CLAIMS_PAYROLL: {
      type: String
    },
    GROUP_NAME: {
      type: Number
    },
    WORKING_TYPE_LEAVES: {
      type: Number
    },
    HOLIDAYS_INCLUDED: {
      type: Number
    },
    FULL_YEAR: {
      type: Number
    },
    HALF_YEAR: {
      type: Number
    },
    mailTrap : {
      type : Object
    }, 
    PAYSLIP_DOWNLOAD_BASE_URL : {
      type : String,
    },
    updated_by:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    products_and_services: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

configSchema.plugin(toJSON);
configSchema.plugin(paginate);
module.exports = mongoose.model('configuration', configSchema);
