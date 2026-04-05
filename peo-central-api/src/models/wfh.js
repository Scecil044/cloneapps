const mongoose = require('mongoose')
const wfhSchema = new mongoose.Schema({
    from_date: {
        type: Date,
    },
    request_type: {
        type: String,
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
    status: {
        type: String,
    },
    user_id: {
        type: String,
    },
    approvals:{
        type : Array
    },
    appliction_log: {
        type: Array
    },
    created_by_id:{
        type: String,
    },
    attachments:{
        type:Object
    },
    half_day : {
        type: Boolean
    },
    date_created: {
        type: Date,
        default: Date.now
    }
}) 

module.exports = mongoose.model('Wfh', wfhSchema)