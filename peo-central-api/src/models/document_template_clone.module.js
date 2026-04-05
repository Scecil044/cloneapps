const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const documentstemplatecloneScheme = new mongoose.Schema({
    name: {
        type: String
    },
    content: {
        type: String
    },
    autoReplacedContent: {
        type: String
    },
    fileUrl: {
        type: String,
    },
    module: {
        type: String
    },
    module_id: {
        type: String
    },
    auto_replace_keys: {
        type: Array
    },
    user_input_keys: {
        type: Array
    },
    additional_input_keys: {
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
    condition: {
        type: Object
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


documentstemplatecloneScheme.plugin(toJSON);
documentstemplatecloneScheme.plugin(paginate);
documentstemplatecloneScheme.plugin(deletion);

const DocumentTemplatesClone = mongoose.model("document_templates_clone", documentstemplatecloneScheme)
module.exports = DocumentTemplatesClone