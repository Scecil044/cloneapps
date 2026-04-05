const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const emailTemplateCloneSchema = new mongoose.Schema({
    name: {
        type: String
    },
    content: {
        type: String
    },
    module: {
        type: String
    },
    module_id: {
        type: String
    },
    to: {
        type: Array
    },
    cc: {
        type: Array
    },
    auto_replace_keys: {
        type: Array
    },
    user_input_keys: {
        type: Array
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


    emailTemplateCloneSchema.plugin(toJSON);
    emailTemplateCloneSchema.plugin(paginate);
    emailTemplateCloneSchema.plugin(deletion);

const EmailTemplateClone = mongoose.model("EmailTemplateClone", emailTemplateCloneSchema)
module.exports = EmailTemplateClone