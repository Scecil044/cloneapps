const mongoose = require('mongoose')
const { Types: { ObjectId } } = mongoose;

const policiesSchema = new mongoose.Schema({
    link: { type: String },
    filename: { type: String },
    created_by: { type: String },
    time: { type: Date },
    deleted: { type: Boolean },
    name: { type: String },
    category: { type: String },
    requires_signature: { type: Boolean, default: true },
    signed_by: [],
});

const coreConfigSchema = new mongoose.Schema({
    company_ID: {
        type: ObjectId
    },
    news_categories: {
        type: Array,
        default: []
    },
    visa_sponsors: {
        type: Array,
        default: []
    },
    branding: {
        type: Object,
        default: {
            "login": {
              "logo": "https://nathanhrerp.s3.eu-central-1.amazonaws.com/branding/logo.svg",
              "side": {
                "header": {
                  "maxHeight": "500",
                  "maxWidth": 325,
                  "url": "https://nathanhrerp.s3.eu-central-1.amazonaws.com/branding/panda.jpg"
                },
                "title": "Welcome to Nathan & Nathan MCS ",
                "subtitle": "Your Next Gen ERP portal Hey"
              },
              "background": "https://nathanhrerp.s3.eu-central-1.amazonaws.com/branding/peacock.jpg"
            },
            "is_default": false
        },
    },
    absence_criteria: {
        type: Object,
        default: {
            "clock_in_missing": true,
            "clock_out_missing": true
        }
    },
    module_access: {
        type: Array,
        default: []
    },
    requestTypes: {
        type: Array,
        default: []
    },
    grades: {
        type: Array,
        default: []
    },
    document_types: {
        type: Array,
        default: []
    },
    policies: {
        type: Array,
        default: [policiesSchema]
    },
    employment_types: {
        type: Array,
        default: []
    },
    designations: {
        type: Array,
        default: []
    },
    dept: {
        type: Array,
        default: []
    },
    access_modules: {
        type: Array,
        default: []
    },
    supportTicketCategories: {
        type: Array,
        default: []
    },
    business_trip_config:{
        type: Object,
        default: {}
    },
  }, {
    timestamps: true
  })

  module.exports = mongoose.model('coreconfigs', coreConfigSchema)