const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const payrollprocessSchema = new mongoose.Schema({
    pay_month: {
        type: String,
    },
    payrollRun: {
        type: Array
    },
    status: {
        type: String,
    },
    approved_by_id: {
        type: String,
    },
    approvals: {
        type: Array
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
        type: Array
    },
    company_id: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    closedDate: {
        type: Date,
    },
    payrollCategory: {
        type: String
    }
},
    {
        timestamps: true
    });

// payrollprocessSchema.plugin(toJSON);
payrollprocessSchema.plugin(paginate);
payrollprocessSchema.plugin(deletion);

const PayrollProcess = mongoose.model("PayrollProcess", payrollprocessSchema)
module.exports = PayrollProcess
