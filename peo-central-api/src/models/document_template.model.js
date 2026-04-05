const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");
const validator = require('validator')

const documentTemplateScheme = new mongoose.Schema({
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
    condition : {
        type : Object,
        default : {
            type : '', 
            name : ''
        }
    }, 
    auto_replace_keys: {
        type: Array,
        required: true
    },
    user_input_keys: {
        type: Array,
        required: true
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


documentTemplateScheme.plugin(toJSON);
documentTemplateScheme.plugin(paginate);
documentTemplateScheme.plugin(deletion);

const Document_templates = mongoose.model("Document_templates", documentTemplateScheme)
module.exports = Document_templates