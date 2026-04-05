const mongoose = require('mongoose');

const Customer = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        logo: {
            type: String,
            default: '',
        },
        industry: {
            type: String,
        },
        phone: {
            type: String,
        },
        website: {
            type: String,
        },
        email: {
            type: String,

        },
        country: {
            type: String,
        },
        city: {
            type: String,
        },
        verified_date: {
            type: String,
            default: false
        },
        last_contacted: {
            type: String,
        },
        group_name: {
            type: String,
        },
        comments: {
            type: String,
        },
        notes: {
            type: String,
        },
        lead_source: {
            type: String,
        },
        consultant: {
            type: String,
        },
        uploaded: {
            type: Boolean,
            default: true
        },
        status: {
            type: String,
            default: 'active',
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
    },

    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Customer', Customer);
