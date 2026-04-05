const mongoose = require('mongoose')


const approvalsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    module: {
        type: String,
        enum: ["attendance", "leave", "letter", "wfh", "claim", "education", "salary adjustment", "passport", "shift", "loan", "time in lieu", "trips"]
    },
    approvers: {
        type: Object,
        default: {
            approver_levels: "",
            level_1: [],
            level_2: [],
            level_3: [],
            level_4: [],
            level_5: []
        }
    },
    required_approvers: {
        type: Object,
        default: {
            level_1: {}, // required_number, group_name
            level_2: {},
            level_3: {},
            level_4: {},
            level_5: {}
        }
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    application_log: {
        type: Array
    },
    deleted: {
        type: Boolean,
        default: false
    },
    dateUpdated: {
        type: Date,
    },
    updatedBy: {
        type: String
    }
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Approvals', approvalsSchema)