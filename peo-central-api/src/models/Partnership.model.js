const mongoose = require('mongoose');

const POCSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    designation: {type: String},
  },
  { _id: false }
);

const PartnershipSchema = new mongoose.Schema(
  {
    company_name: { type: String },
    company_logo: { type: String, default: '' },
    company_url: { type: String },
    company_email: { type: String },
    headquarters: { type: String },
    points_of_contact: {
      primary: { type: POCSchema },
      secondary: { type: POCSchema, required: false },
      additional_pocs: [POCSchema]
    },
    partnership_stage: {
      type: String,
      enum: [
        'Contacted',
        'Discussion In Process',
        'Signed Partnership',
        'Successful Partnership',
        'Unsuccessful Partnership'
      ]
    },
    peo_services_countries: [String],
    eor_services_countries: [String],
    eor_services_for_expats: [String],
    own_entity_countries: [String],
    global_eor_provider_countries: [String],
    pricing_details: {
      service_fees: { type: String },
      contract_length: { type: String }
    },
    remarks: { type: String },
    // documents: [String],
    documents: [
      {
        url: { type: String },
        file_name: { type: String },
        mime_type: { type: String },
        size_in_bytes: { type: Number },
      },
    ],
    follow_up_date: { type: Date },
    reason_for_unsuccessful: { type: String, default: '' },
    contacted_via: { type: String },
    // contacted: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
  },
  { timestamps: true }
);

const Partner = mongoose.model('Partner', PartnershipSchema);
module.exports = Partner;
