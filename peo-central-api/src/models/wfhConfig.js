const mongoose = require('mongoose')
const wfhConfigSchema = new mongoose.Schema({
    company_ID : {
        type : mongoose.Schema.Types.ObjectId,
        required: true
    },
	wfhTypes: {
        type: Array
    },
    wfhConds: {
        type: Array
    },
    wfhAccess: {
        type: Array
    }
})
// module.exports = mongoose.model('WFHConfig', wfhConfigSchema)
module.exports = mongoose.model('WFHConfiguration', wfhConfigSchema)