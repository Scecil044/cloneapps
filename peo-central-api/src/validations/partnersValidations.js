const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Points of Contact schema for Joi
const POCSchema = Joi.object({
  name: Joi.string().allow(""),
  email: Joi.string().email().allow(""),
  phone: Joi.string().allow(""),
  designation: Joi.string().allow(""),
});

// Validator for creating a partner
const createPartner = {
  body: Joi.object().keys({
    company_name: Joi.string().required().messages({
      'any.required': 'Company name is required',
      'string.empty': 'Company name cannot be empty'
    }),
    company_url: Joi.string().uri().required().messages({
      'any.required': 'Company URL is required',
      'string.uri': 'Invalid URL format for company URL'
    }),
    company_email: Joi.string().email().required().messages({
      'any.required': 'Company email is required',
      'string.email': 'Invalid email format for company email'
    }),
    headquarters: Joi.string().required().messages({
      'any.required': 'Headquarters location is required',
      'string.empty': 'Headquarters location cannot be empty'
    }),
    points_of_contact: Joi.object({
      primary: POCSchema.required().messages({
        'any.required': 'Primary POC is required'
      }),
      secondary: POCSchema.optional(),
      additional_pocs: Joi.array().items(POCSchema).optional()
    }),
    partnership_stage: Joi.string()
      .valid(
        'Contacted',
        'Discussion In Process',
        'Signed Partnership',
        'Successful Partnership',
        'Unsuccessful Partnership'
      )
      .required()
      .messages({
        'any.required': 'Partnership stage is required',
        'any.only': 'Invalid partnership stage'
      }),
    peo_services_countries: Joi.array().items(Joi.string()).optional(),
    eor_services_countries: Joi.array().items(Joi.string()).optional(),
    eor_services_for_expats: Joi.array().items(Joi.string()).optional(),
    own_entity_countries: Joi.array().items(Joi.string()).optional(),
    attachments: Joi.array()
      .items(
        Joi.object({
          mime_type: Joi.string().required(),
          file_name: Joi.string().required(),
          url: Joi.string().uri().required(),
          isDeleted: Joi.boolean().optional(),
          size_in_bytes: Joi.number().required()
        })
      )
      .optional(),

    global_eor_provider_countries: Joi.array().items(Joi.string()).optional(),
    pricing_details: Joi.object({
      service_fees: Joi.string().optional().allow(null, ''),
      contract_length: Joi.string().optional().allow(null, '')
    }).optional(),
    remarks: Joi.string().optional().allow(null, ''),
    reason_for_unsuccessful: Joi.string().optional().allow(null, ''),
    company_logo: Joi.string().optional().allow(null, ''),
    contacted_via: Joi.string().valid('Email', 'Website', 'LinkedIn').required().messages({
      'any.required': 'contacted via field is required',
      'string.empty': 'Mode of contact cannot be empty'
    }),
    documents: Joi.array().items(Joi.string().uri()).optional(),
    follow_up_date: Joi.date().allow("").optional(),
    // contacted: Joi.boolean().default(false),
    is_deleted: Joi.boolean().default(false)
    // updatedBy: Joi.string().custom(objectId).optional(),
    // deletedBy: Joi.string().custom(objectId).optional()
  })
};

// Validator for updating a partner
const updatePartner = {
  params: Joi.object().keys({
    partnerId: Joi.string().custom(objectId).required().messages({
      'any.required': 'Partner ID is required',
      'string.custom': 'Invalid Partner ID format'
    })
  }),
  body: Joi.object().keys({
    company_name: Joi.string().optional(),
    company_url: Joi.string().uri().optional(),
    company_email: Joi.string().email().optional(),
    headquarters: Joi.string().optional(),
    points_of_contact: Joi.object({
      primary: POCSchema.optional(),
      secondary: POCSchema.optional(),
      additional_pocs: Joi.array().items(POCSchema).optional()
    }).optional(),
    partnership_stage: Joi.string()
      .valid(
        'Contacted',
        'Discussion In Process',
        'Signed Partnership',
        'Successful Partnership',
        'Unsuccessful Partnership'
      )
      .optional(),
    peo_services_countries: Joi.array().items(Joi.string()).optional(),
    eor_services_countries: Joi.array().items(Joi.string()).optional(),
    eor_services_for_expats: Joi.array().items(Joi.string()).optional(),
    own_entity_countries: Joi.array().items(Joi.string()).optional(),
    global_eor_provider_countries: Joi.array().items(Joi.string()).optional(),
    pricing_details: Joi.object({
      service_fees: Joi.string().optional().allow(null, ''),
      contract_length: Joi.string().optional().allow(null, '')
    }).optional(),
    remarks: Joi.string().optional().allow(null, ''),
    documents: Joi.array().items(Joi.string().uri()).optional(),
    follow_up_date: Joi.date().optional(),
    attachments: Joi.array()
      .items(
        Joi.object({
          mime_type: Joi.string().required(),
          file_name: Joi.string().required(),
          url: Joi.string().uri().required(),
          isDeleted: Joi.boolean().optional(),
          size_in_bytes: Joi.number().required()
        })
      )
      .optional(),
    contacted: Joi.boolean().optional(),
    is_deleted: Joi.boolean().optional(),
    updatedBy: Joi.string().custom(objectId).optional(),
    deletedBy: Joi.string().custom(objectId).optional(),
    attachments: Joi.array()
    .items(
      Joi.object({
        mime_type: Joi.string().required(),
        file_name: Joi.string().required(),
        url: Joi.string().uri().required(),
        isDeleted: Joi.boolean().optional(),
        size_in_bytes: Joi.number().required()
      })
    )
    .optional(),
  })
};

// Validator for deleting a partner
const deletePartner = {
  params: Joi.object().keys({
    partnerId: Joi.string().custom(objectId).required().messages({
      'any.required': 'Partner ID is required',
      'string.custom': 'Invalid Partner ID format'
    })
  })
};

// Validator for getting a partner by ID
const getPartnerById = {
  params: Joi.object().keys({
    partnerId: Joi.string().custom(objectId).required().messages({
      'any.required': 'Partner ID is required',
      'string.custom': 'Invalid Partner ID format'
    })
  })
};

module.exports = {
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerById
};
