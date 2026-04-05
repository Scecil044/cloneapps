const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCompany = {
    body: Joi.object().keys({
        legal_name: Joi.string(),
        company_name: Joi.string(),
        registration_number: Joi.string(),
        requires_payroll_input: Joi.boolean(),
        logo: Joi.string(),
        phone: Joi.string(),
        email: Joi.string(),
        company_address: Joi.string(),
         address:Joi.string().allow("").optional().allow(null),
        trn_number: Joi.string().allow(null).allow("").optional(),
        PO_number: Joi.string().allow("").optional(),
        GRN_number: Joi.string().allow("").optional(),
        country: Joi.string(),
        website: Joi.string(),
        status: Joi.string().valid('active', 'inactive', 'new').optional().default('new'),
        parent_id: Joi.string(),
        contact_person: Joi.array().items(
            Joi.object({
              name: Joi.string(),
              phone: Joi.string(),
              email: Joi.string().email({ tlds: { allow: false } }),
              designation: Joi.string(),
              department: Joi.string()
            })
          ),
        configurations: Joi.object(),
        locations: Joi.array(),
        bank_details: Joi.array(),
        available_insurances: Joi.array(),
        created_date: Joi.string(),
        updated_date: Joi.string(),
        business_industry: Joi.string(),
        type_of_business: Joi.string(),
        no_of_employees: Joi.string(),
        company_notes: Joi.string(),
        payroll_schedule: Joi.object(),
        letterDetail: Joi.object(),
        billing_address: Joi.object({
            company_name: Joi.string().trim(),
            address_line1: Joi.string().trim(),
            address_line2: Joi.string().trim().optional().allow(""),
            city: Joi.string().trim(),
            state: Joi.string().trim(),
            zip: Joi.string().trim(),
            country: Joi.string().trim(),
            phone: Joi.string().trim(),
            email: Joi.string().trim().email({ tlds: { allow: false } })
          }),
          shipping_address: Joi.object({
            company_name: Joi.string().trim().allow(""),
            address_line1: Joi.string().trim().allow(""),
            address_line2: Joi.string().trim().optional().allow(""),
            city: Joi.string().trim().allow(""),
            state: Joi.string().trim().allow(""),
            zip: Joi.string().trim().allow(""),
            country: Joi.string().trim().allow(""),
            phone: Joi.string().trim().allow(""),
            special_instructions: Joi.string().trim().optional().allow("").empty(""),
            email: Joi.string().trim().email({ tlds: { allow: false } }) // 👈 add this
          }),          
          selected_company_id: Joi.array().optional()
    })
}

const companiesById = {
    params: Joi.object().keys({
        companyId: Joi.required().custom(objectId),
    })
}

const updateCompaniesOnId = {
    params: Joi.object().keys({
      companyId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        address:Joi.string().allow("").optional().allow(null),
        legal_name: Joi.string(),
        unique_code: Joi.string(),
        company_name: Joi.string(),
        registration_number: Joi.string().allow("").allow(null).optional(),
        trn_number: Joi.string().allow("").allow(null).optional(),
        PO_number: Joi.string(),
        GRN_number: Joi.string(),
        requires_payroll_input: Joi.boolean(),
        invoice_format: Joi.string(),
        logo: Joi.string().allow("", null).optional(),
        phone: Joi.string().allow("", null).optional(),
        email: Joi.string().email({ tlds: { allow: false } }),
        company_address: Joi.string().allow("", null).optional(),
        country: Joi.string().allow("", null).optional(),
        website: Joi.string(),
        status: Joi.string().valid("active", "inactive", "new").optional(),
        parent_id: Joi.string(),
  
        contact_person: Joi.array().items(
          Joi.object({
            name: Joi.string(),
            phone: Joi.string(),
            email: Joi.string().email({ tlds: { allow: false } }),
            designation: Joi.string(),
            department: Joi.string(),
          })
        ),
  
        configurations: Joi.object(),
        locations: Joi.array(),
        available_insurances: Joi.array(),
        bank_details: Joi.array(),
        created_by: Joi.string(),
        updated_by: Joi.string(),
        updated_date: Joi.string(),
        business_industry: Joi.string(),
        type_of_business: Joi.string(),
        no_of_employees: Joi.string(),
        company_notes: Joi.string(),
        payroll_schedule: Joi.object(),
        upfront_costs: Joi.object(),
        upfront_costs_ees: Joi.object(),
        monthly_costs_ees: Joi.object(),
        monthly_costs: Joi.object(),
  
        billing_address: Joi.object({
          company_name: Joi.string().trim().allow("").optional(),
          address_line1: Joi.string().trim().allow("").optional(),
          address_line2: Joi.string().trim().allow("").optional(),
          city: Joi.string().trim().allow("").optional(),
          state: Joi.string().trim().allow("").optional(),
          zip: Joi.string().trim().allow("").optional(),
          country: Joi.string().trim().allow("").optional(),
          phone: Joi.string().trim().allow("").optional(),
          email: Joi.string().trim().email({ tlds: { allow: false } }).allow("").optional(),
        }),
  
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
          email: Joi.string().trim().email({ tlds: { allow: false } }).allow("").optional(),
        }),
  
        details_updated: Joi.string().optional(),
      })
      .min(1),
  };
  

const getAll = {
    query: Joi.object().keys({
        legal_name: Joi.string(),
        company_name: Joi.string(),
        trn_number: Joi.string(),
        PO_number: Joi.string(),
        GRN_number: Joi.string(),
        registration_number: Joi.string(),
        logo: Joi.string(),
        phone: Joi.string(),
        email: Joi.string(),
        company_address: Joi.string(),
        country: Joi.string(),
        website: Joi.string(),
        status: Joi.string(),
        parent_id: Joi.string(),
        contact_person: Joi.array(),
        configurations: Joi.object(),
        locations: Joi.array(),
        available_insurances: Joi.array(),
        bank_details: Joi.array(),
        created_by: Joi.string(),
        updated_by: Joi.string(),
        timestamps: true,
        created_date: Joi.string(),
        updated_date: Joi.string(),
        business_industry: Joi.string(),
        type_of_business: Joi.string(),
        no_of_employees: Joi.string(),
        company_notes: Joi.string(),
        payroll_schedule: Joi.object(),
        upfront_costs: Joi.object(),
        billing_address: Joi.object(),
        shipping_address: Joi.object(),
        requires_payroll_input: Joi.string(),
    })
}

module.exports = {
    createCompany,
    companiesById,
    updateCompaniesOnId,
    getAll
}
