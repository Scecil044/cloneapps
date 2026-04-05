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
const Onboarding = require("./onboardings.model");
const VisaProcess = require("./visaprocess.model");
const Offboarding = require("./offboardings.model");
const Renewal = require("./renewals.model");
const config = require('../config/config');

const usersSchema = new mongoose.Schema(
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
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
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
    other_phone: {
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
        // allergies: '',
        // speciality: '',
        skill_sets: '',
        personal_email: '',
        personal_mobile: '',
        extension: '',
        speed_dial: '',
        uae_local_address:'',
        other_personal_mobile: '',
      },
    },
    // ejari: {
    //   type: Object,
    //   default: {
    //     contractNumber: '',
    //     issueDate: '',
    //     expirationDate: '',
    //     attachment: '',
    //   },
    // },
    // dewa: {
    //   type: Object,
    //   default: {
    //     accountNumber: '',
    //     premisesNumber: '',
    //     attachment: '',
    //     titleDeed: '',
    //   },
    // },
    residencyLastUpdated:{
      type: Date,
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
        last_working_day: '',
      },
    },
    emergency: {
      type: Object,
      default: {
        name: '',
        relationship: '',
        phone: '',
        email: '',
        other_phone: '',
      },
    },
    emergency_uae: {
      type: Object,
      default: {
        name: '',
        relationship: '',
        phone: '',
        email: '',
        other_phone: '',
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
        // Salary_transfer_letter_provided: false,
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
        // hra_allowance: 0,
        other_allowance: 0,
        food_allowance: 0,
        transportation_allowance: 0,
        mobile_allowance: 0,
        total_fixed: 0,
        remarks: "",
        // retention_required:false,
      },
    },
    uploadedSalaryTransfer: {type: Boolean, default: false},
    uploadedSalaryClearance: {type: Boolean, default: false},


    salary_rotation_required:{
      type: Boolean,
      default: false,
    },
    // salary_transfer_required:{
    //   type: Boolean,
    //   default: false,
    // },
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
        car_allowance:0,
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
      ref: 'Companies',
    },
    company_ID: {
      type: String
    },
    role_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roles',
    },
    user_status: {
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
      default:"https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1753350626269_user.jpg/user.jpg"
    },
    firstLogin: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
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
    onboarding_replace_keys: {
      type: Array,
    },
    additional_costs: {
      type: Object,
    },
    reference_number:{
      type: String
    },
    assigned_escalation_manager: { type: mongoose.Schema.Types.ObjectId},
    insurance_agent:{ type: Object,
      default: {
        full_name:'',
        email:'',
        _id:'',
      }
    },
    assigned_insurance_agent: { type: mongoose.Schema.Types.ObjectId},
    assigned_hr_specialist: { type: mongoose.Schema.Types.ObjectId},
    assigned_support_agent: { type: mongoose.Schema.Types.ObjectId},
    has_support_agent_role: {type: Boolean, default: false},
    has_hr_specialist_role: {type: Boolean, default: false},
    has_escalation_manager_role: {type: Boolean, default: false},
    has_insurance_agent_role: {type: Boolean, default: false},
    hasMobileLoggedIn: { type: Boolean, default: false },
    firstMobileLoginDate: { type: Date },
    is_internal_staff:{
      type: Boolean,
      default: false
    },
    hasPortalAccess:{
      type: Boolean,
      default: true
    },
    backup_reason: {
      type: String
    },
  },
  {
    timestamps: true,
  }
);


usersSchema.plugin(toJSON);
usersSchema.plugin(paginate);
usersSchema.plugin(deletion);

usersSchema.pre('save', function (next) {
  if (!this.salary) return next();

  const mapping = {
    'housing/hra_allowance': 'house_allowance',
    'transportation/car_allowance': 'transportation_allowance',
  };

  for (const [oldKey, newKey] of Object.entries(mapping)) {
    if (this.salary.hasOwnProperty(oldKey)) {
      this.salary[newKey] = this.salary[oldKey];
      delete this.salary[oldKey];
    }
  }

  next();
});


usersSchema.post('save', async function() {
  // Skip if this is a new document to avoid infinite save loops
  if (this.isNew) return;

  let needsUpdate = false;
  const salary = this.salary;

  // Non-numeric fields that should be excluded from conversion and summation
  const nonNumericFields = ['remarks', 'retention_required'];
  let calculatedTotal = 0;

  for (const [field, value] of Object.entries(salary)) {
    // Skip non-numeric fields
    if (nonNumericFields.includes(field)) continue;

    // Convert to number if it's not already a number
    if (typeof value !== 'number') {
      salary[field] = Number(value) || 0;
      needsUpdate = true;
    }

    // Add to total (only if not in nonNumericFields)
    if (!nonNumericFields.includes(field) && field !== 'total_fixed') {
      calculatedTotal += Number(salary[field]) || 0;
    }
  }

  if (salary.total_fixed !== calculatedTotal) {
    salary.total_fixed = calculatedTotal;
    needsUpdate = true;
  }

  if (needsUpdate) {
    await this.constructor.findOneAndUpdate(
      { _id: this._id },
      { $set: { salary: salary } },
      { new: true }
    );
  }
});
// add indexes
usersSchema.index({is_deleted:1}, {background:true})
usersSchema.index({first_name: 1});
usersSchema.index({last_name: 1});
usersSchema.index({ email: 1, role_ID: 1, user_status: 1, is_deleted: 1 }, {background: true});

// Add indexes for performance optimization
// Critical index for getAllUsersMols route optimization
usersSchema.index({ user_status: 1, is_deleted: 1 }, {background: true});

// Additional optimization indexes
usersSchema.index({ _id: 1, user_status: 1, is_deleted: 1 }, {background: true});
usersSchema.index({ company_id: 1, user_status: 1, is_deleted: 1 }, {background: true});


usersSchema.post("save", async function () {
  try {
    await this.model("users").findByIdAndUpdate(this._id, { company_ID: this.company_id.toString() });
  } catch (error) {

    console.error("Error updating post field:", error);

  }

});

// new hook
usersSchema.pre("save", function (next) {
  if (this.salary) {
    const salary = this.salary.toObject ? this.salary.toObject() : this.salary;

    // If house_allowance is provided → move it into housing_allowance
    if (salary.house_allowance !== undefined) {
      this.salary.housing_allowance = Number(salary.house_allowance);
      this.salary.house_allowance = undefined;
    }

    // Non-numeric fields that should be excluded from conversion and summation
    const nonNumericFields = ['remarks', 'retention_required'];

    // Always recalc total_fixed, excluding non-numeric fields
    let newTotal = 0;
    for (const [key, value] of Object.entries(this.salary.toObject ? this.salary.toObject() : this.salary)) {
      // Skip non-numeric fields and total_fixed
      if (nonNumericFields.includes(key) || key === "total_fixed") {
        continue;
      }
      const num = Number(value);
      if (!isNaN(num)) {
        newTotal += num;
      }
    }

    // Round to 2 decimals
    this.salary.total_fixed = Math.round((newTotal + Number.EPSILON) * 100) / 100;
  }

  next();
});



usersSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

usersSchema.pre("save", async function(next){
  if (!this.isModified("assigned_escalation_manager") &&
  !this.isModified("assigned_insurance_agent") &&
  !this.isModified("assigned_hr_specialist") &&
  !this.isModified("assigned_support_agent")) {
return next();
}
  const updates = {};
  const userId = this._id;
  if (this.isModified("assigned_escalation_manager")) {
    updates.assigned_escalation_manager = this.assigned_escalation_manager || null;
  }
  if (this.isModified("assigned_insurance_agent")) {
    updates.assigned_insurance_agent = this.assigned_insurance_agent || null;
  }
  if (this.isModified("assigned_hr_specialist")) {
    updates.assigned_hr_specialist = this.assigned_hr_specialist || null;
  }
  if (this.isModified("assigned_support_agent")) {
    updates.assigned_support_agent = this.assigned_support_agent || null;
  }
  try {
    await Promise.all([
      Onboarding.updateMany({ user_id: userId }, { $set: updates }, {new: true}),
      VisaProcess.updateMany({ user_id: userId }, { $set: updates }, {new: true}),
      Offboarding.updateMany({ user_id: userId }, { $set: updates }, {new: true}),
      Renewal.updateMany({ user_id: userId }, { $set: updates }, {new: true}),
    ]);

    console.log("Related models updated successfully:", updates);
  } catch (error) {
    console.error("Error updating related models:", error);
    return next(error);
  }
  next();
})

usersSchema.pre('findOneAndUpdate', async function (next) {
  // Hash the password before saving the user model
  const user = this;
  if (user._update.password != undefined) {
    if (user._update.password.substr(0, 7) != '$2a$08$') {
      user._update.password = await bcrypt.hash(user._update.password, 8);
    }
  }

  // Handle salary calculations for findOneAndUpdate operations
  if (user._update && user._update.$set && user._update.$set.salary) {
    const salaryUpdate = user._update.$set.salary;

    if (salaryUpdate && typeof salaryUpdate === 'object') {
      // Handle house_allowance to housing_allowance mapping
      if (salaryUpdate.house_allowance !== undefined) {
        salaryUpdate.housing_allowance = Number(salaryUpdate.house_allowance);
        delete salaryUpdate.house_allowance;
      }

      // Non-numeric fields that should be excluded from conversion and summation
      const nonNumericFields = ['remarks', 'retention_required'];

      // Calculate total_fixed, excluding non-numeric fields
      let newTotal = 0;
      for (const [key, value] of Object.entries(salaryUpdate)) {
        // Skip non-numeric fields and total_fixed
        if (nonNumericFields.includes(key) || key === "total_fixed") {
          continue;
        }
        const num = Number(value);
        if (!isNaN(num)) {
          newTotal += num;
        }
      }

      // Round to 2 decimals and update
      salaryUpdate.total_fixed = Math.round((newTotal + Number.EPSILON) * 100) / 100;

      // Update the salary object with the calculated total
      user._update.$set.salary = salaryUpdate;
    }
  }

  next();
});

usersSchema.methods.checkRole = async function () {
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

usersSchema.methods.generateAuthTokens = async function () {
  const user = this;
  /* Access token generation */
  console.log("Access token will expire after", config.jwt.accessExpirationMinutes, "minutes")
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
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


const Users = mongoose.model('users', usersSchema);
module.exports = Users;
