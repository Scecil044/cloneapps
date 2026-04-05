const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const documentsScheme = new mongoose.Schema({
    type: {
        type: mongoose.Schema.Types.ObjectId
    },
    name: {
        type: String,
        default: ""
    },
    url: {
        type: String,
        default: ""
    },
    document_number: {
        type: String
    },
    update_logs: {
        type: Array
    },
    issuance: {
        type: String
    },
    expiry: {
        type: String
    },
    module: {
        type: String
    },
    identifier: {
        type: String
    },
    doc_status: {
        type: String
    },
    foreign_id: {
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
    reason_for_deletion: {
        type: String,
        default: ""
    },
    deleted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    deleted_at: {
        type: Date
    },
    created_date: {
        type: String
    },
    updated_date: {
        type: String
    },
    folder_ref:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DocumentFolder"
    }
},
    {
        timestamps: true
    });


documentsScheme.plugin(toJSON);
documentsScheme.plugin(paginate);
documentsScheme.plugin(deletion);

// Add indexes for performance optimization
// Critical compound index for getAllUsersMols route optimization
documentsScheme.index({ foreign_id: 1, type: 1, document_number: 1 }, { background: true });

// Additional optimization indexes
documentsScheme.index({ type: 1, foreign_id: 1 }, { background: true });
documentsScheme.index({ foreign_id: 1, is_deleted: 1 }, { background: true });
documentsScheme.index({ type: 1, is_deleted: 1 }, { background: true });

const Documents = mongoose.model("Documents", documentsScheme)
module.exports = Documents
