const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const offboardiongScheme = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    last_working_day: {
        type: String
    },
    assigned_pro: {
        type: mongoose.Schema.Types.ObjectId
    },
    assigned_escalation_manager: { type: mongoose.Schema.Types.ObjectId},
    assigned_insurance_agent: { type: mongoose.Schema.Types.ObjectId},
    assigned_hr_specialist: { type: mongoose.Schema.Types.ObjectId},
    assigned_support_agent: { type: mongoose.Schema.Types.ObjectId},
    user_location: {
        type: String,
        default: ''
    },
    terminationReason: {
        type: String,
        default: ''
    },
    family_sponsored: {
        type: String,
        default: ''
    },
    exit_reason: {
        type: String
    },
    salary_payable: {
        type: Object,
        default: {}
    },
    is_unsuccessful: {
        type: Boolean,
        default: false
    },
    reason_for_unsuccessful: {
        type: String,
        default: ""
    },
    leave_encashment: {
        type: Object,
        default: {}
    },
    gratuity: {
        type: Object,
        default: {}
    },
    support_letter: {
        type: Array
    },
    processes: {
        type: Array
    },
    process_type: {
        type: String
    },
    create_eosb: {
        type: Object,
        default: {}
    },
    create_invoice: {
        type: Object,
        default: {}
    },
    record_payments: {
        type: Object,
        default: {}
    },
    attachments: {
        type: Array
    },
    comments: {
        type: Array
    },
    status: {
        type: String
    },
    created_by: {
        type: String
    },
    updated_by: {
        type: String
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
    }
},
    {
        timestamps: true
    });

offboardiongScheme.plugin(toJSON);
offboardiongScheme.plugin(paginate);
offboardiongScheme.plugin(deletion);

const Offboarding = mongoose.model("offboarding", offboardiongScheme)
module.exports = Offboarding
