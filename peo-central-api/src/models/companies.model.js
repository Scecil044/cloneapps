const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');
const validator = require('validator');

const departmentsScchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  head_of_department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  size:{
    type: Number,
  }
});
const companiesSchema = new mongoose.Schema(
  {
    legal_name: {
      type: String,
      unique: true
      // required: true
    },
    company_name: {
      type: String,
      unique: true,
      // required: true
    },
    registration_number: {
      type: String,
      // required: true
    },
    departments:{
      type: [departmentsScchema],
      default: []
    },
    trn_number: {
      type: String,
      // required: true
    },
    logo: {
      type: String
    },
    is_lead: {
      type: Boolean,
      default: false
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
      // required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      }
    },
    company_email: {
      type: String,
      // required: true,
      trim: true,
      lowercase: true,
      // validate(value) {
      //   if (!validator.isEmail(value)) {
      //     throw new Error('Invalid email');
      //   }
      // },
      unique: true
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
    country: {
      type: String
    },
    company_notes: {
      type: String
    },
    website: {
      type: String
      // required: true
    },
    status: {
      type: String,
      default: "active",
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
          designation: '',
          department: 'HR Point of Contact'
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
        automated_payroll: false,
        input_cutoff_date: 'Every 15',
        invoice_date: 'Every 20',
        payment_due_notification: 'Every 25',
        salary_payment_date: 'Every 28',
        mandatory_input: false,
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
      email: {
        type: String,
        trim: true,
        lowercase: true,
        // validate(value) {
        //   if (!validator.isEmail(value)) {
        //     throw new Error('Invalid email');
        //   }
        // }
      }
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

    available_insurances: {
      type: Array,
      default: []
    },
    bank_details: {
      type: Object
    },
    unique_code: {
      type: String,
      unique: true,
    },
    reference_number: {
      type: String,
    },
    created_by: {
      type: String
    },
    updated_by: {
      type: String,
      unique: true,
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
    isEnrolledClient: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: false },
  },
  {
    timestamps: true
  }
);

companiesSchema.plugin(toJSON);
companiesSchema.plugin(paginate);
companiesSchema.plugin(deletion);

companiesSchema.pre("save", function (next) {
  const validDepartments = [
    "Escalation Point of Contact",
    "Financial Point of Contact",
    "HR Point of Contact",
  ];

  if (Array.isArray(this.contact_persons)) {
    this.contact_persons = this.contact_persons.map((cp) => {
      let department = cp.department || ""; // handle missing field

      if (!validDepartments.includes(department)) {
        department = "HR Point of Contact"; // default correction
      }

      return { ...cp, department };
    });
  }

  next();
});
companiesSchema.pre('validate', function (next) {
  if (this.isModified('email') && !this.isModified('company_email')) {
    this.company_email = this.email;
  } else if (this.isModified('company_email') && !this.isModified('email')) {
    this.email = this.company_email;
  }
  next();
});

const Companies = mongoose.model('Companies', companiesSchema);
module.exports = Companies;
