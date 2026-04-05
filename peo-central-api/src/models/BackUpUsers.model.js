const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const moment = require('moment');
const { Token } = require('../models');
const { toJSON, paginate, deletion } = require('./plugins');
const { ObjectId } = require('mongodb');
const { toLower } = require('lodash');
const Roles = require('./roles.model');

const userBackupSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    middle_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      // unique: true,
      trim: true,
      lowercase: true,
      // required: true,
      // validate(value) {
      //   if (!validator.isEmail(value)) {
      //     throw new Error('Invalid email');
      //   }
      // },
    },
    designation: {
      type: String,
    },
    contact_number: {
      type: String,
    },
    phone: {
      type: String,
    },
    process_type: {
      type: String,
    },
    password: {
      type: String,
    },
    date_of_joining: {
      type: String,
    },
    emp_id: {
      type: String,
    },
    personal: {
      type: Object,
      default: {
        dob: '',
        gender: '',
        address: '',
        marital_status: '',
        nationality: '',
        allergies: '',
        speciality: '',
        skill_sets: '',
        personal_email: '',
        personal_mobile: '',
        extension: '',
        speed_dial: '',
      },
    },
    insurance: {
      type: Object,
      default: {
        insurance_card: '',
        insurance_name: '',
        insurance_card_no: '',
        network_name: '',
        network_list: '',
        coverage_list: '',
        expiry_date: '',
      },
    },
    employment: {
      type: Object,
      default: {
        contract_type: '',
        employment_type: '',
        work_location: '',
        designation: '',
        visa_designation: '',
        visa_type: '',
        contract_start_date: '',
        contract_end_date: '',
        working_days: '0',
        working_hours: '0',
        probation_period: '0',
        notice_period: '0',
      },
    },
    emergency: {
      type: Object,
      default: {
        name: '',
        relationship: '',
        phone: '',
        name_1: '',
        relationship_1: '',
        phone_1: '',
      },
    },
    bank: {
      type: Object,
      default: {
        account_number: '',
        iban: '',
        bank_name: '',
        bank_post_office: '',
        bank_address: '',
        salary_payment_mode: '',
        mol_wps_no: '',
        routing_code: '',
        sub_salary_payment_mode: '',
      },
    },
    documents: {
      type: Array,
    },
    reporting: {
      type: Object,
    },
    manager_name: {
      type: String,
    },
    department: {
      type: String,
    },
    work_schedule: {
      type: String,
    },
    probation_period: {
      type: String,
    },
    probation_period_end: {
      type: String,
    },
    cost_center: {
      type: String,
    },
    onboarding: {
      type: Object,
    },
    monthly_costs: {
      type: Object,
    },
    leaves: {
      type: Object,
      default: {
        annual_leaves: '0',
        medical_leaves: '0',
        maternity_leaves: '0',
        emergency_leaves: '0',
        parental_leaves: '0',
        leave_taken: '0',
        leave_balance: '0',
        leave_encashment: '0',
      },
    },
    salary: {
      type: Object,
      default: {
        basic_salary: 0,
        housing_allowance: 0,
        hra_allowance: 0,
        other_allowance: 0,
        food_allowance: 0,
        transportation_allowance: 0,
        total_fixed: 0,
      },
    },
    nonwps_salary: {
      type: Object,
      default: {
        basic_salary: 0,
        housing_allowance: 0,
        hra_allowance: 0,
        other_allowance: 0,
        food_allowance: 0,
        transportation_allowance: 0,
        total_fixed: 0,
      },
    },
    salary_change_log: {
      type: Array,
      default: [],
    },
    gratuity: {
      type: Object,
      default: {
        gratuity_for: '0',
        gratuity_amount: '0',
      },
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    role_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roles',
    },
    user_status: {
      type: String,
    },
    backup_reason: {
      type: String,
    },
    payroll_details: {
      type: Object,
      default: {},
    },
    tokens: {
      type: Array,
    },
    competencies: {
      type: Array,
    },
    socials: {
      type: Object,
    },
    attachments: {
      type: Array,
    },
    unique_token: {
      type: String,
    },
    banner_photo: {
      type: String,
    },
    covid_details: {
      type: Object,
    },
    dashboard: {
      type: Array,
    },
    fb_tokens: {
      type: Array,
    },
    surveys: {
      type: Array,
    },
    workAccess: {
      type: Array,
    },
    onboarding: {
      type: Object,
    },
    image_url: {
      type: String,
    },
    firstLogin: {
      type: Boolean,
    },
    created_by: {
      type: String,
    },
    accessTag: {
      type: Array,
    },
    updated_by: {
      type: String,
    },
    dependent_details: {
      type: Array,
    },
    place_of_registration: {
      type: String,
    },
    unsuccessful_login_attempts: {
      type: Number,
    },
    last_unsuccessful_login_time: {
      type: Date,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    payslip_password: {
      type: String,
    },
    created_date: {
      type: String,
    },
    updated_date: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userBackupSchema.plugin(toJSON);
userBackupSchema.plugin(paginate);
userBackupSchema.plugin(deletion);

userBackupSchema.pre('save', async function (next) {
  // Hash the password before saving the user model
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userBackupSchema.pre('findOneAndUpdate', async function (next) {
  // Hash the password before saving the user model
  const user = this;
  if (user._update.password != undefined) {
    if (user._update.password.substr(0, 7) != '$2a$08$') {
      user._update.password = await bcrypt.hash(user._update.password, 8);
    }
  }
  next();
});

userBackupSchema.methods.checkRole = async function () {
  this.isAdmin = false;
  this.isSuperAdmin = false;
  this.isEmployee = false;
  this.isHR = false;
  this.isManager = false;
  this.isFinanceMgr = false;
  this.isCEO = false;
  this.isHRMgr = false;
  const role = await Roles.find({ _id: ObjectId(this.role_ID) });
  const role_name = role[0].role_name;
  if (toLower(role_name) === 'admin') {
    this.isAdmin = true;
  } else if (toLower(role_name) === 'finance manager') {
    this.isFinanceMgr = true;
  } else if (toLower(role_name) === 'manager') {
    this.isManager = true;
  } else if (toLower(role_name) === 'ceo') {
    this.isCEO = true;
  } else if (toLower(role_name) === 'employee') {
    this.isEmployee = true;
  } else if (toLower(role_name) === 'hr manager') {
    this.isHRMgr = true;
  } else if (toLower(role_name) === 'super admin') {
    this.isSuperAdmin = true;
  }
  return this;
};

userBackupSchema.methods.generateAuthTokens = async function () {
  const user = this;
  /* Access token generation */
  const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
  const accessPayload = {
    _id: user._id,
    role_id: user.role_ID,
    iat: moment().unix(),
    exp: accessTokenExpires.unix(),
    type: 'access',
  };
  const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET_API);

  /* Refresh token generation */
  const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_HOURS, 'hours');

  const refreshPayload = {
    _id: user._id,
    role_id: user.role_ID,
    iat: moment().unix(),
    exp: refreshTokenExpires.unix(),
    type: 'refresh',
  };

  const refreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET_API);

  let token = {
    blacklisted: false,
    token: refreshToken,
    user: user._id,
    role: user.role_ID,
    expires: refreshTokenExpires,
    type: 'refresh',
  };

  const token_insert = new Token(token);
  let insertToken = await token_insert.save();
  // await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH, false, isFreelancer);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};


const UserBackUp = mongoose.model('UserBackUp', userBackupSchema);
module.exports = UserBackUp;
