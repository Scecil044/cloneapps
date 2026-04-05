const mongoose = require('mongoose')
const requestsSchema = new mongoose.Schema({
    request_type: {
        type: String,
    },
    letter_type: {
        type: String,
    },
    letter_sub_type: {
        type: String
    },
    status: {
        type: String
    },
    claims: {
        type: Array
    },
    letter_fields: {
        type: Object
    },
    approvals: {
        type: Array
    },
    replies: {
        type: Array
    },
    admin_open_msg: {
        type: String
    },
    user_open_msg: {
        type: String
    },
    contentafter: {
        type: String
    },
    contentbefore: {
        type: String
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    //    type: String
    },
    assigned_to: {
        type: String
    },
    company_id: {
        type: String
    },
    file:{
        type:Object
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    pdfStyles: {
        type: Object
    },
    previewStyles: {
        type: Object
    },
    letterImages: {
        type: Object,
    },
    signatory: {
        type: Object
    },
    letter_keys: {
        type: Array
    },
    user_keys: {    
        type: Boolean
    },
    pdf_url: {
        type: String
    },
    appliction_log: {
        type: Array
    },
    payroll_process: {
        type: Boolean
    },
    payroll_auto_approved: {
        type: Boolean
    },
    dateUpdated: {
        type: Date,
    },
    updatedBy: {
        type: String
    }
})

module.exports = mongoose.model('Requests', requestsSchema)