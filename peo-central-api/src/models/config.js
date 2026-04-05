const mongoose = require('mongoose')
const confcoreSchema = new mongoose.Schema({
    company_id: {
        type: String,
    },
    holiday_calendar: {
        type: Array,
    },
    leaveTypes: {
        type: Array,
    },   
    rolls:{
        type: Array,
    },
    settings:{
        type: Object,
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
})



const ConfigCore = mongoose.model('conf_core', confcoreSchema)
module.exports = ConfigCore