const mongoose = require('mongoose');
const { paginate } = require("./plugins")

const emailLogsSchema = new mongoose.Schema(
    {
        from: {
            type: String,
        },
        to: {
            type: Array,
        },
        cc: {
            type: Array,
        },
        others: {
            type: Array
        },
        subject: {
            type: String
        },
        body: {
            type: String
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId
        },
        is_deleted: {
            type: Boolean,
            default: false
        }, 
        attachments : {
            type : Array, 
            default : []
        }
    },
    {
        timestamps: true
    }
);

emailLogsSchema.plugin(paginate);
const Emaillog = mongoose.model('email_log', emailLogsSchema);
module.exports = Emaillog;