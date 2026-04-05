const mongoose = require("mongoose");
const { paginate } = require("./plugins")

const statementSchema = new mongoose.Schema({
    company_id: {type: mongoose.Schema.Types.ObjectId, ref:"Companies", required: true},
    statement_number: {type: String, required: true, unique: true},
    statement_date: {type: Date, required: true},
    period_start: {type: Date, required: true},
    period_end: {type: Date, required: true},
    opening_balance: {type: Number, required: true, default: 0},
    closing_balance: {type: Number, required: true, default: 0},
    total_debit: {type: Number, required: true, default: 0},
    total_credit: {type: Number, required: true, default: 0},
    items: [{
        date: {type: Date, required: true},
        type: {type: String, enum: ['invoice', 'credit_note', 'debit_note', 'payment'], required: true},
        document_id: {type: mongoose.Schema.Types.ObjectId, required: true},
        document_number: {type: String, required: true},
        description: {type: String, required: true},
        debit_amount: {type: Number, required: true, default: 0},
        credit_amount: {type: Number, required: true, default: 0},
        running_balance: {type: Number, required: true}
    }],
    status: {type: String, enum: ['draft', 'sent', 'viewed'], default: 'draft'},
    is_deleted: {type: Boolean, default: false},
}, {timestamps: true});


statementSchema.plugin(paginate)
module.exports = mongoose.model("Statement", statementSchema);
