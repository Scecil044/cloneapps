const mongoose = require('mongoose')

const claimConfigSchema = new mongoose.Schema({
    claim_ref_no :{
        type: Number,
    },
    ClaimSubTypes:{
        type: Array,
    },
    claimTypes : {
        type: Array,
    },
    company_ID:{
        type: mongoose.Schema.Types.ObjectId
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
module.exports = mongoose.model('claimConfig', claimConfigSchema)
