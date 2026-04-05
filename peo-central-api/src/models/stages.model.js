const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const stagesSchema = new mongoose.Schema({
    stage_name: {
        type: String,
        required: true
    },
    module: {
        type: String
    }, 
    section_name: {
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


stagesSchema.plugin(toJSON);
stagesSchema.plugin(paginate);
stagesSchema.plugin(deletion);

const Stage = mongoose.model("Stage", stagesSchema)
module.exports = Stage
