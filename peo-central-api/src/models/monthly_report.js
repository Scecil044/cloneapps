const mongoose = require('mongoose')
const monthlyReportSchema = new mongoose.Schema({
    report:{
        type: Object
    },
    date:{
        type:String
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('MonthlyReport', monthlyReportSchema)