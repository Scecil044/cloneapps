const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const payslipsSchema = new mongoose.Schema({
    user_id: {
        type: String,
    },
    emp_id: {
        type: String,
    },
    full_name: {
        type: String,
    },
    iban: {
        type: String,
    },
    bank_name: {
        type: String
    },
    pay_month: {
        type: String,
    },
    designation: {
        type: String,
    },
    date_of_joining: {
        type: String,
    },
    total_salary: {
        type: Number,
    },
    absent_days: {
        type: String,
    },
    present_days: {
        type: String,
    },
    days_in_month: {
        type: String,
    },
    payrollprocesses_id: {
        type: String,
    },
    total_salary_text: {
        type: String,
    },
    fixed: {
        type: Map,
        of: Number
    },
    variable: {
        type: Map,
        of: Number
    },
    company_id: {
        type: String
    },
    payroll_type: {
        type: String
    },
    payroll_title: {
        type: String
    },
    payrollCategory: {
        type: String
    },
    mol_wps_no: {
        type: String
    },
    payslip_url : {
        type : String,
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    });

// payslipsSchema.plugin(toJSON);
payslipsSchema.plugin(paginate);
payslipsSchema.plugin(deletion);

const Payslips = mongoose.model("Payslips", payslipsSchema)
module.exports = Payslips
