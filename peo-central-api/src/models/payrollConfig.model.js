const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require("./plugins");

const payrollConfigSchema = new mongoose.Schema({
    company_ID : {
        type : mongoose.Schema.Types.ObjectId,
        required: true
    },
    bankNameOptions: {
        type: Array,
    },
    costCenterOptions: {
        type: Array,
    },
    deduction: {
        type: Array,
    },
    earning: {
        type: Array,
    },
    fixed: {
        type: Array,
    },
    paymentModeOptions: {
        type: Array,
    },
    recurring_deduction: {
        type: Array,
    },
    recurring_earning: {
        type: Array,
    },
    sendPayslipOptions: {
        type: Array,
    },
    payslip_sender_email: {
        type: String,
    },
    employer_mol_number: {
        type: String,
    },
    employer_bank_routing_code: {
        type: String,
    },
    recursiveRequestApprovals: {
        type: Array
    },
    INCLUDE_ATTENDANCE: {
        type: Boolean
    },
    IS_WORKING_DAYS_TYPE: {
        type: Boolean
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
    FINANCIAL_START_MONTH: {
        type: Number
    },
    ADD_CLAIMS_PAYROLL: {
        type: String
    },
    SYSTEM_EMAIL_ID: {
        type: String
    },
    GROUP_NAME: {
        type: String
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
    salary_sheet_closing_date: {
        type: String
    },
    visa_sponsor_options: {
        type: Array
    },
    payitemApprovals: {
        type: Array
    },
    prorating_calculation: {
        type: Object
    },
    lop_calculation: {
        type: Object
    },
    salaryAdjustmentApprover: {
        type: Array
    },
    eosApprovals: {
        type: Array
    },
    FINAL_CONFIRMATION_EMAIL_ID_PAYROLL: {
        type: String,
    },
    copy_keys: {
        type: Array
    },

    personal_copy_keys: {
        type :  Array
    },

    reporting_copy_keys: {
        type :  Array
    },

    bank_copy_keys: {
        type :  Array
    },

    documents_copy_keys: {
        type :  Array
    },
})

payrollConfigSchema.plugin(toJSON);
payrollConfigSchema.plugin(paginate);
payrollConfigSchema.plugin(deletion);

module.exports = mongoose.model('PayRollConfig', payrollConfigSchema)