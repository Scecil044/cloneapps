const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const documentsTypesScheme = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    view: {
        type: Array
    },
    edit: {
        type: Array
    },
    created_by: {
        type: String
    },
    updated_by: {
        type: String
    },
    name: {
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


documentsTypesScheme.plugin(toJSON);
documentsTypesScheme.plugin(paginate);
documentsTypesScheme.plugin(deletion);

const DocumentTypes = mongoose.model("Document_types", documentsTypesScheme)
module.exports = DocumentTypes