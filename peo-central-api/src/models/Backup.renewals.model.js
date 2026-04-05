const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const renewalsBackupSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    processes: {
        type: Array
    },
    process_type: {
        type: String
    },
    is_unsuccessful: {
        type: Boolean,
        default: false
    },
    reason_for_unsuccessful: {
        type: String,
        default: ""
    },
    create_work_order: {
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
    assigned_pro : {
        type : mongoose.Schema.Types.ObjectId
    }, 
    created_date: {
        type: String
    },
    updated_date: {
        type: String
    },
    visa_type: {
        type: String,
        default: ''
    },
    upfront_costs: {
        type: Object,
        default: {}
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
},
    {
        timestamps: true
    });

renewalsBackupSchema.plugin(toJSON);
renewalsBackupSchema.plugin(paginate);
renewalsBackupSchema.plugin(deletion);

const RenewalsBackUp = mongoose.model("RenewalsBackUp", renewalsBackupSchema)
module.exports = RenewalsBackUp
