const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const OnboardingBackupSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    stage_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    processes: {
        type: Array
    },
    is_unsuccessful: {
        type: Boolean,
        default: false
    },
    reason_for_unsuccessful: {
        type: String,
        default: ""
    },
    employment_contract: {
        type: Object,
        default: {}
    },
    create_work_order: {
        type: Object,
        default: {}
    },
    upfront_costs: {
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
    process_type: {
        type: String
    },
    attachments: {
        type: Array
    },
    comments: {
        type: Array
    },
    stage_type: {
        type: String
    },
    status: {
        type: String
    },
    have_eid: {
        type: String,
        default: ''
    },
    vip: {
        type: String,
        default: ''
    },
    user_location: {
        type: String,
        default: ''
    },
    visa_type: {
        type: String,
        default: ''
    },
    medical_center: {
        type: Object,
        default: {}
    },
    eid_center: {
        type: Object,
        default: {}
    },
    tawjeeh_center: {
        type: Object,
        default: {}
    },
    assigned_pro: {
        type: mongoose.Schema.Types.ObjectId
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
    },
    backup_reason: {
        type: String,
      },
},
    {
        timestamps: true
    });



OnboardingBackupSchema.plugin(toJSON);
OnboardingBackupSchema.plugin(paginate);
OnboardingBackupSchema.plugin(deletion);

const OnboardingBackup = mongoose.model("OnboardingBackup", OnboardingBackupSchema)
module.exports = OnboardingBackup
