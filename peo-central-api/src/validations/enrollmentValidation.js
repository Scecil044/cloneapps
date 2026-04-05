const { objectId } = require("./custom.validation");
const Joi = require("joi");


const updateEnrollment = {
  body: Joi.object().keys({
    GRN_number: Joi.string().optional().allow(""),
    available_insurances: Joi.array().items(Joi.string()).optional().default([]),
    bank_details: Joi.array().items(
      Joi.object({
        account_number: Joi.string().required(),
        bank_address: Joi.string().required(),
        bank_name: Joi.string().required(),
        country: Joi.string().required(),
        iban: Joi.string().required(),
        salary_payment_mode: Joi.string().optional().allow(""),
        swift_code: Joi.string().optional().allow(""),
      })
    ).optional(),
    billing_address: Joi.object({
      company_name: Joi.string().trim().allow("").optional(),
      address_line1: Joi.string().trim().allow("").optional(),
      address_line2: Joi.string().trim().allow("").optional(),
      city: Joi.string().trim().allow("").optional(),
      state: Joi.string().trim().allow("").optional(),
      zip: Joi.string().trim().allow("").optional(),
      country: Joi.string().trim().allow("").optional(),
      phone: Joi.string().trim().allow("").optional(),
      email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).allow("").optional(),
    }).optional(),
    shipping_address: Joi.object({
      company_name: Joi.string().trim().allow("").optional(),
      address_line1: Joi.string().trim().allow("").optional(),
      address_line2: Joi.string().trim().allow("").optional(),
      city: Joi.string().trim().allow("").optional(),
      state: Joi.string().trim().allow("").optional(),
      zip: Joi.string().trim().allow("").optional(),
      country: Joi.string().trim().allow("").optional(),
      phone: Joi.string().trim().allow("").optional(),
      special_instructions: Joi.string().trim().allow("").optional(),
      email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).allow("").optional(),
    }).optional(),
    status: Joi.string().valid('Pending', 'Processing', 'Completed').optional(),
    is_editable: Joi.boolean().optional(),
    letterDetail: Joi.object({
      companyLogoLink: Joi.string().uri().allow("").optional(),
      websiteUrl: Joi.string().uri().allow("").optional(),
      signatureLink: Joi.string().uri().allow("").optional(),
    }).optional(),
    contact_persons: Joi.array().items(
      Joi.object({
        name: Joi.string().trim().required(),
        phone: Joi.string().trim().required(),
        email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
        designation: Joi.string().trim().optional().allow("").allow(null),
      })
    ).optional(),
    upfront_costs: Joi.object().pattern(
      Joi.string(),
      Joi.string().regex(/^\d+$/).allow("0")
    ).optional(),
    upfront_costs_ees: Joi.object().pattern(
      Joi.string(),
      Joi.string().regex(/^\d+$/).allow("0")
    ).optional(),
    payroll_schedule: Joi.object({
      invoice_date: Joi.string().allow("").optional(),
      payment_due_notification: Joi.string().allow("").optional(),
      salary_payment_date: Joi.string().allow("").optional(),
    }).optional(),
    configurations: Joi.object({
      modules: Joi.string().optional(),
      self_services: Joi.string().valid("YES", "NO").optional(),
      contract: Joi.string().valid("Unlimited", "Limited").optional(),
    }).optional(),
    locations: Joi.array().items(Joi.string()).optional(),
    is_deleted: Joi.boolean().optional(),
    monthly_costs: Joi.object().pattern(
      Joi.string(),
      Joi.string().allow("").optional()
    ).optional(),
    requires_payroll_input: Joi.boolean().optional(),
    invoice_format: Joi.string().valid("company", "individual").optional(),
    details_updated: Joi.boolean().optional(),
    documents: Joi.object({
      certification: Joi.string().uri().allow("").optional(),
      passport_copy: Joi.string().uri().allow("").optional(),
      vat_certificate: Joi.string().uri().allow("").optional(),
      signed_kyc: Joi.string().uri().allow("").optional(),
    }).optional(),
    legal_name: Joi.string().trim().optional(),
    company_address: Joi.string().trim().optional(),
    business_industry: Joi.string().trim().optional(),
    registration_number: Joi.string().trim().optional(),
    trn_number: Joi.string().trim().optional(),
    phone_number_code: Joi.string().trim().optional(),
    phone_number: Joi.string().trim().optional(),
    country: Joi.string().trim().optional(),
    website: Joi.string().allow("").optional(),
    linkedIn: Joi.string().allow("").optional(),
    phone: Joi.string().trim().optional(),
    company_name: Joi.string().trim().optional(),
    email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).optional(),
    _id: Joi.string().length(24).optional(),
    id: Joi.string().custom(objectId).length(24).optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    selected_company_id: Joi.array().optional().default([]),
    company_id: Joi.string().custom(objectId).optional(),
    metaData: Joi.object().optional(),
    isOnboardedLead: Joi.boolean().optional().allow(null),
    trade_license_number: Joi.string().trim().optional().allow(null).allow(""),
    company_phone: Joi.string().trim().optional().allow(null).allow(""),
    logo: Joi.string().uri().optional().allow(null).allow(""),
    PO_number: Joi.string().trim().optional().allow(null).allow(""),
    trn_number: Joi.string().trim().optional().allow(null).allow(""),
    phone_number: Joi.string().trim().optional().allow(null).allow(""),
    type_of_business: Joi.string().trim().optional().allow(null).allow(""),
    no_of_employees: Joi.string().trim().optional().allow(null).allow(""),
    company_notes: Joi.string().trim().optional().allow(null).allow(""),
    // status: Joi.string().valid('Active', 'Inactive', 'Pending').optional(),
    parent_id: Joi.string().custom(objectId).optional().allow(null).allow(""),
    vat_number: Joi.string().trim().optional().allow(null).allow(""),
    place_of_reg: Joi.string().trim().optional().allow(null).allow(""),
    trade_license_expiry_date: Joi.date().optional().allow(null),
    reference_number: Joi.string().trim().optional().allow(null).allow(""),
    requires_payroll_input: Joi.boolean().optional().default(false).allow(null),
  }),
};



module.exports = {
    updateEnrollment
}