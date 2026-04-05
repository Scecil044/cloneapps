const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");
const validator = require('validator')

const smsTemplateScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    module: {
        type: String
    },
    flag: {
        type: String
    },
    to: {
        type: Array
    },
    cc: {
        type: Array
    },
    auto_replace_keys: {
        type: Array,
        required: true
    },
    user_input_keys: {
        type: Array,
        required: true
    },
    subject: {
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
    add_attachments: {
        type: Boolean,
        default: true
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


smsTemplateScheme.plugin(toJSON);
smsTemplateScheme.plugin(paginate);
smsTemplateScheme.plugin(deletion);

const SMS_templates = mongoose.model("sms_templates", smsTemplateScheme)
module.exports = SMS_templates