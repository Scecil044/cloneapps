const mongoose = require("mongoose")
const { toJSON, paginate, deletion } = require("./plugins");
const Company = require("./companies.model");

const leadsSchema = new mongoose.Schema(
  {
    processes: {
      type: Array,
      default: [],
    },
    lead_name: {
      type: String,
    },
    status: {
      type: String,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    company_email: {
      type: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    client_type: {
      type: String,
    },
    service_type: {
      type: String,
    },
    inquiry_date: {
      type: Date,
      default: Date.now,
    },
    contact_person: {
      type: Object,
      default: {
        name: '',
        phone: '',
        email: '',
      },
    },
    lead_details: {
      type: Object,
      default: {
        inquiry_type: '',
        lead_rating: '',
        lead_action: '',
        status: '',
        overall_total_order_value: 0,
        deal_size: '',
        eor_requirements: '',
        requirements: '',
      },
    },
    created_by: {
      type: String,
    },
    updated_by: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    is_unsuccessful: {
      type: Boolean,
      default: false,
    },
    reason_for_unsuccessful: {
      type: String,
      default: '',
    },
    proposal_creation: {
      type: Object,
      default: {},
    },
    agreement_creation: {
      type: Object,
      default: {},
    },
    unsuccessful_on: {
      type: String,
    },
    created_date: {
      type: String,
    },
    updated_date: {
      type: String,
    },
    timeline_to_hire:{
      type: String,
      enum: ['0-1 month', '1-3 months', '3-6 months', '6-12 months', '12+ months'],
    },
    engagement_level:{
      type: String,
      enum: ['Higly Engaged', 'Low', 'Occasional'],
    },
    decision_maker_involvement:{
      type: String,
      // enum: ['Direct Contact With Decision Maker', 'Indirect or Unsure'],
    },
    kyc_details: {
      type: Object,
      default: {
        // Client Type
        clientType: '',

        // Basic Information
        fullName: '',
        tradingName: '',
        nationality: '',
        dateOfBirth: null,
        placeOfBirth: '',

        // Addresses
        residentialAddress: {
          city: '',
          country: '',
          postalCode: ''
        },
        mailingAddress: {
          city: '',
          country: '',
          postalCode: ''
        },

        // Contact Information
        email: '',
        phone: '',
        mobile: '',
        website: '',

        // Individual-specific
        gender: '', // if clientType === 'individual'

        // Company-specific
        ultimateBeneficialOwners: [],

        // Board of Directors / Authorized Signatories
        boardMembers: [],

        // Financial Information
        financialInfo: {
          natureOfBusiness: '',
          expectedTurnover: '',
          currency: '',
          bankName: '',
          branch: '',
          accountNumber: '',
          iban: ''
        },

        // Documents - actual uploaded files
        documents: {
          passport: '',
          emirates_id: '',
          national_id: '',
          certificate_of_incorporation: '',
          memorandum_articles: '',
          vat_certificate: '',
          authorized_signatory_id: ''
        },

        // Compliance
        pepStatus: '', // 'not_pep' | 'pep' | 'pep_family'

        // Consent & Signatures
        consent: {
          dataProcessing: false,
          regulatorySharing: false,
          ongoingMonitoring: false,
          falseInformation: false
        },

        signature: {
          signature: '', // base64 or file path
          fullName: '',
          designation: '', // only for companies
          date: null,
          place: '',
          signatureType: 'typed' // 'typed' | 'drawn'
        },

        // Metadata
        submittedAt: null,
        isComplete: false
      }
    }
  },
  {
    timestamps: true,
  }
);


leadsSchema.plugin(toJSON);
leadsSchema.plugin(paginate);
leadsSchema.plugin(deletion);

leadsSchema.pre("save", async function (next) {
  if (this.company_id) {
    const companyDoc = await Company.findById(this.company_id);
    if (!companyDoc) {
      return next(new Error("Company does not exist"));
    }

    if (!this.company_email || this.company_email !== companyDoc.email) {
      this.company_email = companyDoc.email;
    }
  }
  next();
});


const Leads = mongoose.model("Leads", leadsSchema)
module.exports = Leads
