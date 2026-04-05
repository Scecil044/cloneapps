const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");

const payitemScheme = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    invoice_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    pay_month: {
        type: String
    },
    type: {
        type: String
    },
    category: {
        type: String
    },
    remarks: {
        type: String
    },
    amount: {
        type: String
    },
    currency: {
        type: String
    },
    unpaid: {
        type: String
    },
    ot_type: {
        type: String
    },
    hours: {
        type: String
    },
    status: {
        type: String,
        default: "new"
    },
    created_by: {
        type: String
    },
    updated_by: {
        type: String
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_date: {
        type: String
    },
    updated_date: {
        type: String
    }
},
    {
        timestamps: true
    });

payitemScheme.plugin(toJSON);
payitemScheme.plugin(paginate);
payitemScheme.plugin(deletion);

const Payitem = mongoose.model("pay_item", payitemScheme)
module.exports = Payitem
