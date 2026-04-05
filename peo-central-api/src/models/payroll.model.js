const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const payrollSchema = new mongoose.Schema({
    pay_month: {
        type: String,
    },
    user_id: {
        type: String,
    },
    company_id: {
        type: String
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    earning_type: {
        type: String,
    },
    category: {
        type: String,
    },
    amount: {
        type: Number,
    },
    status: {
        type: String,
    },
    remarks: {
        type: String,
    },
    created_by_id: {
        type: String,
    },
    approved_by_id: {
        type: String,
    },
    logs: {
        type: Array,
    },
    payment_mode: {
        type: String
    },
    recursive_id: {
        type: String,
    },
    payroll_type: {
        type: String
    },
    payroll_title: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    payrollCategory: {
        type: String
    }
},
    {
        timestamps: true
    });

// payrollSchema.plugin(toJSON);
payrollSchema.plugin(paginate);
payrollSchema.plugin(deletion);

const Payroll = mongoose.model("Payrolls", payrollSchema)
module.exports = Payroll
