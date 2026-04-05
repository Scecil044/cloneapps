const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const processesScheme = new mongoose.Schema({
    process_name: {
        type: String
    },
    module: {
        type: String,
        required: true,
    },
    conditions: {
        type: Object,
        default: {}
    },
    stages: {
        type: Array
    },
    substeps: {
        type: Boolean,
        default: false,
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

processesScheme.plugin(toJSON);
processesScheme.plugin(paginate);
processesScheme.plugin(deletion);

const Processes = mongoose.model("processes", processesScheme)
module.exports = Processes
