const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const payrollInvoiceSchema = new mongoose.Schema(
    {
        payroll_invoice_number: {
            type: String,
            required: true,
        },
        customer: {
            type: ObjectId,
            required: true,
        },
        company: {
            type: ObjectId,
            required: true,
        },
        cost_center: {
            type: ObjectId,
        },
        customer_name: {
            type: String,
            required: true,
        },
        customer_address: {
            type: String,
        },
        customer_trn: {
            type: Number,
        },
        branch: {
            type: String,
        },
        email: {
            type: String,
            required: true,
        },
        billing_address: {
            type: String
        },
        shipping_address: {
            type: String
        },
        order_number: {
            type: String,
        },
        terms: {
            type: ObjectId
        },
        terms_name: {
            type: String
        },
        due_date: {
            type: Date
        },
        invoice_date: {
            type: Date
        },
        sale_location: {
            type: String
        },
        sale_person: {
            type: String,
        },
        items: {
            type: Array,
            required: true,
        },
        sub_total: {
            type: Number,
            required: true,
        },
        vat_total: {
            type: Number
        },
        discount_total: {
            type: Number
        },
        total: {
            type: Number,
            required: true,
        },
        partial_amount: {
            type: Number
        },
        status: {
            type: String,
        },
        paid: {
            type: Boolean,
            default: false,
        },
        void: {
            type: Boolean,
            default: false,
        },
        write_off: {
            type: Boolean,
            default: false,
        },
        credit_applied: {
            type: Boolean,
            default: false,
        },
        debit_applied: {
            type: Boolean,
            default: false,
        },
        debit_notes: {
            type: Array,
        },
        credit_amount: {
            type: Number,
            default: 0,
        },
        void_reason: {
            type: String,
        },
        write_off_reason: {
            type: String,
        },
        is_recurring: {
            type: Boolean
        },
        is_draft: {
            type: Boolean,
            default: false,
        },
        recurring_template: {
            type: ObjectId,
        },
        subject: {
            type: String,
        },
        customer_notes: {
            type: String,
        },
        terms_condition: {
            type: String,
            default: null,
        },
        documents: {
            type: Array,
        },
        balance_due: {
            type: Number,
        },
        invoice_path: {
            type: Array,
        },
        payment_note_link: {
            type: Array,
        },
        cancelled: {
            type: Number,
            default: 0,
        },
        estimate: {
            type: ObjectId,
        },
        is_deleted: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('payroll_invoice', payrollInvoiceSchema);
