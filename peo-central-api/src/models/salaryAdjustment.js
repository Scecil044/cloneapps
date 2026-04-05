const mongoose = require('mongoose')

const processSchema = new mongoose.Schema({
    user_id:{
		type: String,
	},
    company_id:{
		type: String,
	},
	new_salary:{
		type: Object
	},
	old_salary:{
		type: Object
	},
	proratingCalculation:{
		type: Array
	},
	isAmount:{
		type: Boolean
	},
	isPercentage:{
		type: Boolean
	},
	salaryPercentageChanges:{
		type: Array
	},
	isUpdated :{
		type: Boolean,
	},
	effective_date:{
		type: Date
	},
	approvals:{
		type: Array
	},
    status: {
        type: String, 
    },
    pay_month: {
        type: String, 
    },
    createdBy: {
        type: String, 
    },
    logs:{
        type: Array,
    },
    date_created: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('salaryAdjustment', processSchema)