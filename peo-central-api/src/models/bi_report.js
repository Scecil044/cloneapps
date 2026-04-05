const mongoose = require('mongoose')
const biReportSchema = new mongoose.Schema({
    creator_name:{
        type: String
    },
    export_type:{
        type: String
    },
    report_name:{
        type: String
    },
    access_rights:{
        type: Array
    },
    description:{
        type: String
    },
    user_id:{
        type: String
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('BIReport', biReportSchema)