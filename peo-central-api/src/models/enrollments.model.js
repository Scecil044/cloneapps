const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');
const validator = require('validator');

const enrollmentsScheme = new mongoose.Schema(
  {
    legal_name: {
      type: String
      // required: true
    },
    company_name: {
      type: String
      // required: true
    },
    company_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Companies'
    },
    metaData:{
      type: Object,
      default:{}
    },
    registration_number: {
      type: String,
      // required: true
    },
    trn_number: {
      type: String,
    },
    logo: {
      type: String
    },
    phone: {
      type: String
      // required: true
    },
    company_phone: {
      type: String
      // required: true
    },
    email: {
      type: String,
      required: true,
      // unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      }
    },
    company_address: {
      type: String
    },
    country: {
      type: String
    },
    business_industry: {
      type: String
    },
    type_of_business: {
      type: String
    },
    no_of_employees: {
      type: String
    },
    company_notes: {
      type: String
    },
    website: {
      type: String
      // required: true
    },
    linkedIn: {
      type: String
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed'],
      default: 'Pending'
    },
    is_editable: {
      type: Boolean,
      default: true
    },
    parent_id: {
      type: String
    },
    letterDetail: {
      type: Object,
      default: {
        companyLogoLink: '',
        headerImageLink: {},
        footerImageLink: {},
        companyStampLink: {},
        waterMarkLink: {},
        websiteUrl: '',
        signatureLink: '',
        manager: {},
        leftSideBarLink: {},
        rightSideBarLink: {}
      }
    },
    contact_persons: {
      type: Array,
      default: [
        {
          name: '',
          phone: '',
          email: '',
          designation: ''
        }
      ]
    },
    upfront_costs: {
      type: Object,
      default: {
        'Emplyment Visa': '0',
        'Emiritisation Cost': '0',
        'Medical Insurance': '0',
        'Security Deposit': '0',
        'Employee Statutory Benefits': '0'
      }
    },
    upfront_costs_ees: {
      type: Object,
      default: {
        'Emplyment Visa': '0',
        'Emiritisation Cost': '0',
        'Medical Insurance': '0',
        'Security Deposit': '0',
        'Employee Statutory Benefits': '0'
      }
    },
    payroll_schedule: {
      type: Object,
      default: {
        invoice_date: 'Every 20',
        payment_due_notification: 'Every 25',
        salary_payment_date: 'Every 28'
      }
    },
    trade_license_number: {
      type: String
    },
    GRN_number: {
      type: String
    },
    PO_number: {
      type: String
    },
    vat_number: {
      type: String
    },
    place_of_reg: {
      type: String
    },
    configurations: {
      type: Object,
      default: {
        modules: 'Module1',
        self_services: 'NO',
        contract: 'Unlimited'
      }
    },
    locations: {
      type: Array
    },
    billing_address: {
      company_name: {
        type: String,
        trim: true
      },
      address_line1: {
        type: String,
        trim: true
      },
      address_line2: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      zip: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
    },
    shipping_address: {
      company_name: {
        type: String,
        trim: true
      },
      address_line1: {
        type: String,
        trim: true
      },
      address_line2: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      zip: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      special_instructions: {
        type: String,
        trim: true
      }
    },
    phone_number: {
      type: String
    },
    phone_number_code: {
      type: String
    },
    available_insurances: {
      type: Array
    },
    bank_details: {
      type: Object
    },
    documents: {
      type: Object
    },
    reference_number: {
      type: String,
    },
    created_by: {
      type: String
    },
    updated_by: {
      type: String,
      sparse: true

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
    },
    monthly_costs: {
      type: Object,
      default: {
        'Monthly Salary': 'As Actuals',
        'Nathan & Nathan Service Fee': '0'
      }
    },
    monthly_costs_ees: {
      type: Object
    },
    requires_payroll_input: {
      type: Boolean,
      default: false
    },
    invoice_format: {
      type: String,
      enum: ['individual', 'company'],
      default: 'company'
    },
    details_updated: { type: Boolean, default: false },
    isOnboardedLead: {
      type: Boolean, 
      default: false
    }
  },
  {
    timestamps: true
  }
);

enrollmentsScheme.plugin(toJSON);
enrollmentsScheme.plugin(paginate);
enrollmentsScheme.plugin(deletion);
// enrollmentsScheme.pre('save', function (next) {
//   if (!this.billing_address.address_line1 && !this.shipping_address.address_line1) {
//     next(new Error('At least one address (billing or shipping) must be provided'));
//   } else {
//     next();
//   }
// });

const Enrollments = mongoose.model('enrollments', enrollmentsScheme);
module.exports = Enrollments;
