const mongoose = require('mongoose')
const leavesConfigSchema = new mongoose.Schema({
	holiday_calendar:{
        type: Array,
    },
    leave:{
        type: Array,
    },
    leaveList:{
        type: Array,
    },
    leaveTypes:{
        type: Array,
    },
    leaveAccess:{
        type: Array,
    },
    company_ID:{
        type: mongoose.Schema.Types.ObjectId
    },
    LeaveObject:{
        type: Array,
    },
	updatedDate: {
		type: Date,
		default: Date.now
	},
	updatedBy: {
		type: String,
	},
	createdBy: {
		type: String,
	},
	createdDate: {
		type: Date,
		default: Date.now
	}
})
module.exports = mongoose.model('leaveConfig', leavesConfigSchema)
