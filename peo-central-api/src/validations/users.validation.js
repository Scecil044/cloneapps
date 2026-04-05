const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getAll = {
  query: Joi.object().keys({
    selected_company_id: Joi.array().allow('', '', null),
    first_name: Joi.string(),
    middle_name: Joi.string(),
    last_name: Joi.string(),
    email: Joi.string(),
    designation: Joi.string(),
    contact_number: Joi.string(),
    contract_type: Joi.string(),
    employment_type: Joi.string(),
    process_type: Joi.string(),
    password: Joi.string(),
    date_of_joining: Joi.string(),
    emp_id: Joi.string(),
    personal: Joi.object(),
    insurance: Joi.object(),
    employment: Joi.object(),
    emergency: Joi.object(),
    bank: Joi.object(),
    documents: Joi.object(),
    reporting: Joi.object(),
    onboarding: Joi.object(),
    leaves: Joi.object(),
    salary: Joi.object(),
    salary_change_log: Joi.array(),
    company_id: Joi.string(),
    role_ID: Joi.string(),
    user_status: Joi.string(),
    image_url: Joi.string(),
    firstLogin: Joi.boolean(),
    created_by: Joi.string(),
    accessTag: Joi.array(),
    updated_by: Joi.string(),
    payroll_details: Joi.object(),
    dependent_details: Joi.array(),
    place_of_registration: Joi.string(),
    tokens: Joi.array(),
    competencies: Joi.array(),
    socials: Joi.object(),
    attachments: Joi.array(),
    unique_token: Joi.string(),
    banner_photo: Joi.string(),
    covid_details: Joi.object(),
    dashboard: Joi.array(),
    fb_tokens: Joi.array(),
    surveys: Joi.array(),
    workAccess: Joi.array(),
    onboarding: Joi.object(),
    manager_name: Joi.string(),
    department: Joi.string(),
    work_schedule: Joi.string(),
    work_location: Joi.string(),
    probation_period: Joi.string(),
    probation_period_end: Joi.string(),
    cost_center: Joi.string(),
    gratuity: Joi.object(),
    dob: Joi.string(),
    unsuccessful_login_attempts: Joi.number(),
    last_unsuccessful_login_time: Joi.date(),
    is_deleted: Joi.boolean(),
    created_date: Joi.string(),
    updated_date: Joi.string(),
    hasMobileLoggedIn: Joi.string(),
    insurance_agent: Joi.object(),
    is_internal_staff: Joi.boolean(),
    timestamps: true
  })
};

const deleteUserById = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId)
  })
};

const createUser = {
  body: Joi.object().keys({
    selected_company_id: Joi.array().allow('', '', null),
    first_name: Joi.string(),
    is_internal_staff: Joi.boolean().default(false).optional().allow(null),
    middle_name: Joi.string().allow('', '', null),
    last_name: Joi.string().allow('', '', null),
    email: Joi.string(),
    designation: Joi.string().allow('', '', null),
    contact_number: Joi.string().allow('', '', null),
    contract_type: Joi.string().allow('', '', null),
    employment_type: Joi.string().allow('', '', null),
    process_type: Joi.string().allow('', '', null),
    password: Joi.string(),
    date_of_joining: Joi.string().allow('', '', null),
    emp_id: Joi.string(),
    personal: Joi.object().allow('', '', null),
    insurance: Joi.object().allow('', '', null),
    employment: Joi.object().allow('', '', null),
    emergency: Joi.object().allow('', '', null),
    bank: Joi.object().allow('', '', null),
    documents: Joi.object().allow('', '', null),
    reporting: Joi.object().allow('', '', null),
    onboarding: Joi.object().allow('', '', null),
    leaves: Joi.object().allow('', '', null),
    salary: Joi.object().allow('', '', null),
    nonwps_salary: Joi.object().allow('', '', null),
    user_location: Joi.string().allow('', '', null),
    salary_change_log: Joi.object(),
    company_id: Joi.string().allow('', '', null),
    companyID: Joi.string().allow('', '', null),
    role_ID: Joi.string().allow('', '', null),
    user_status: Joi.string(),
    image_url: Joi.string().allow('', '', null),
    firstLogin: Joi.boolean(),
    accessTag: Joi.array(),
    payroll_details: Joi.object(),
    dependent_details: Joi.array(),
    place_of_registration: Joi.string(),
    dob: Joi.string(),
    tokens: Joi.array(),
    competencies: Joi.array(),
    socials: Joi.object(),
    attachments: Joi.array(),
    unique_token: Joi.string(),
    banner_photo: Joi.string(),
    covid_details: Joi.object(),
    dashboard: Joi.array(),
    fb_tokens: Joi.array(),
    surveys: Joi.array(),
    manager_name: Joi.string(),
    department: Joi.string(),
    work_schedule: Joi.string(),
    work_location: Joi.string(),
    probation_period: Joi.string(),
    probation_period_end: Joi.string(),
    cost_center: Joi.string(),
    workAccess: Joi.array(),
    onboarding: Joi.object(),
    phone: Joi.string().allow('', '', null),
    gratuity: Joi.object(),
    unsuccessful_login_attempts: Joi.number(),
    last_unsuccessful_login_time: Joi.date(),
    created_date: Joi.string(),
    updated_date: Joi.string(),
    has_support_agent_role: Joi.boolean().default(false),
    has_hr_specialist_role: Joi.boolean().default(false),
    has_escalation_manager_role: Joi.boolean().default(false),
    has_insurance_agent_role: Joi.boolean().default(false),
    assigned_insurance_agent: Joi.object()
    // remarks: Joi.string().allow('').optional(),
  })
};

const updateUserById = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  }),
  body: Joi.object()
    .keys({
      is_internal_staff: Joi.boolean().default(false),
      selected_company_id: Joi.array().allow('', '', null),
      first_name: Joi.string(),
      middle_name: Joi.string().allow('', '', null),
      last_name: Joi.string().allow('', '', null),
      email: Joi.string(),
      designation: Joi.string(),
      contact_number: Joi.string(),
      contract_type: Joi.string(),
      employment_type: Joi.string(),
      process_type: Joi.string(),
      password: Joi.string(),
      date_of_joining: Joi.string(),
      emp_id: Joi.string(),
      personal: Joi.object(),
      insurance: Joi.object(),
      employment: Joi.object(),
      emergency: Joi.object(),
      bank: Joi.object(),
      documents: Joi.object(),
      reporting: Joi.object(),
      onboarding: Joi.object(),
      leaves: Joi.object(),
      salary: Joi.object(),
      salary_change_log: Joi.array(),
      company_id: Joi.string(),
      role_ID: Joi.string(),
      user_status: Joi.string(),
      payroll_details: Joi.object(),
      dependent_details: Joi.array(),
      place_of_registration: Joi.string(),
      dob: Joi.string(),
      image_url: Joi.string(),
      reference_number: Joi.string(),
      tokens: Joi.array(),
      competencies: Joi.array(),
      socials: Joi.object(),
      attachments: Joi.array(),
      unique_token: Joi.string(),
      banner_photo: Joi.string(),
      covid_details: Joi.object(),
      manager_name: Joi.string(),
      department: Joi.string(),
      work_schedule: Joi.string(),
      work_location: Joi.string(),
      probation_period: Joi.string(),
      probation_period_end: Joi.string(),
      cost_center: Joi.string(),
      dashboard: Joi.array(),
      fb_tokens: Joi.array(),
      surveys: Joi.array(),
      gratuity: Joi.object(),
      workAccess: Joi.array(),
      onboarding: Joi.object(),
      accessTag: Joi.array(),
      updated_date: Joi.string(),
      has_support_agent_role: Joi.boolean().default(false),
      has_hr_specialist_role: Joi.boolean().default(false),
      has_escalation_manager_role: Joi.boolean().default(false),
      has_insurance_agent_role: Joi.boolean().default(false),
      assigned_escalation_manager: Joi.string().custom(objectId).allow('').optional(),
      assigned_insurance_agent: Joi.object(),
      assigned_hr_specialist: Joi.string().custom(objectId).allow('').optional(),
      assigned_support_agent: Joi.string().custom(objectId).allow('').optional(),
      // remarks: Joi.string().allow('').optional(),
      uploadedSalaryClearance: Joi.boolean(),
      uploadedSalaryTransfer: Joi.boolean(),
      salary_rotation_required: Joi.boolean()
    })
    .min(1)
};

const usersById = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  })
};
const createInternalStaff = {
  body: Joi.object().keys({
    company_ID: Joi.required().custom(objectId).optional().allow(null),
    company_id: Joi.required().custom(objectId).optional().allow(null),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    middle_name: Joi.string().allow('', '', null),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    image_url: Joi.string().allow('', '', null),
    phone: Joi.string().allow('', '', null),
    designation: Joi.string().allow('', '', null),
    department: Joi.string().allow('', '', null).optional(),
    is_internal_staff: Joi.boolean().default(true).required(),
    emailAutomation: Joi.string().optional().allow(null, ''),
    selected_company_id: Joi.array().allow('', '', null)
  })
};

const updateInternalStaff = {
  body: Joi.object().keys({
    company_ID: Joi.required().custom(objectId).optional().allow(null),
    company_id: Joi.required().custom(objectId).optional(),
    first_name: Joi.string().required().optional(),
    last_name: Joi.string().required().optional(),
    middle_name: Joi.string().allow('', '', null).optional(),
    email: Joi.string().email().required().optional(),
    password: Joi.string().allow('', '', null).optional(),
    image_url: Joi.string().allow('', '', null).optional(),
    phone: Joi.string().allow('', '', null).optional(),
    designation: Joi.string().allow('', '', null).optional(),
    department: Joi.string().allow('', '', null).optional(),
    is_internal_staff: Joi.boolean().default(true).required(),
    emailAutomation: Joi.string().optional().allow(null, ''),
    selected_company_id: Joi.array().allow('', '', null)
  }),
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  })
};

const usersByEmail = {
  params: Joi.object().keys({
    email: Joi.required()
  })
};

const fetchEmployeesByCompanyIdAndEmployment = {
  params: Joi.object().keys({
    companyId: Joi.required().custom(objectId)
  }),
  query: Joi.object().keys({
    sponsorType: Joi.string().required(),
    page: Joi.number().default(1),
    limit: Joi.number().default(1000),
    sort: Joi.string().default('createdAt:-1'),
    search: Joi.string().default('')
  })
};

module.exports = {
  getAll,
  deleteUserById,
  createUser,
  updateUserById,
  usersById,
  usersByEmail,
  fetchEmployeesByCompanyIdAndEmployment,
  updateInternalStaff,
  createInternalStaff
};
