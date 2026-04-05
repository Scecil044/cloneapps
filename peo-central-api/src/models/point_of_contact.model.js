const mongoose = require("mongoose")

const pointOfContactScheme = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    name: {
        type: String
    },
    image: {
        type: String
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    salutation: {
        type: String,
    },
    alt_phone: {
        type: String,
    },
    billing_contact: {
        type: String,
    },
    designation: {
        type: String,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    work_country: {
        type: String,
    },
    work_city: {
        type: String,
    },
    address: {
        type: String,
    },
    uploaded: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model("PointOfContact", pointOfContactScheme)

