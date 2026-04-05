const mongoose = require('mongoose')
const leaveSchema = new mongoose.Schema({
    leave_type: {
        type: String,
    },
    leave_condition: {
        type: Array
    },
    from_date: {
        type: Date,
    },
    to_date: {
        type: Date,
    },
    no_of_days: {
        type: String,
    },
    remaining_leaves: {
        type: String,
    },
    reason: {
        type: String,
    },
    certificate: {
        type: Array,
    },
    status: {
        type: String,
    },
    user_name: {
        type: String
    },
    approval_substitute: {
        type: String
    },
    leave_fields: {
        type: Object,
    },
    replies: {},
    admin_open_msg: {
        type: String,
    },
    user_open_msg: {
        type: String,
    },
    user_id: {
        type: String,
    },
    company_id: {
        type: String,
    },
    approvals: {
        type: Array
    },
    attachments: {
        type: Object
    },
    appliction_log: {
        type: Array
    },
    app_status: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    half_day: {
        type: Boolean
    },
    dateUpdated: {
        type: Date,
    },
    updatedBy: {
        type: String,
    }
})

module.exports = mongoose.model('Leaves', leaveSchema)