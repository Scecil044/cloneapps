const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require("./plugins");

const wfhConfigSchema = new mongoose.Schema({
    company_ID : {
        type :  mongoose.Schema.Types.ObjectId,
        required: true
    },
	wfhTypes: {
        type: Array,
        default: []
    },
    wfhConds: {
        type: Array,
        default: []
    },
    wfhAccess: {
        type: Array,
        default: [
            "Always",
            "After Probation",
            "After 6 Months",
            "After 1 Year",
            "Other"
        ],
    }
})

wfhConfigSchema.plugin(toJSON);
wfhConfigSchema.plugin(paginate);
wfhConfigSchema.plugin(deletion);

module.exports = mongoose.model('WFHConfig', wfhConfigSchema)