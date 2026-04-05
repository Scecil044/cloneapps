const { ObjectId } = require('mongodb');
const { Leads } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { uploadFilesToS3 } = require('./aws.service');

const getKycEnrollmentByLeadId = async (leadId) => {
  if (!ObjectId.isValid(leadId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid lead id');
  }

  try {
    const lead = await Leads.findById(leadId);
    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
    }

    return {
      leadId: lead._id,
      kycDetails: lead.kyc_details || {},
      isComplete: lead.kyc_details?.isComplete || false
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error getting KYC enrollment');
  }
};

const createKycEnrollment = async (kycBody) => {
  try {
    const { leadId, ...kycData } = kycBody;

    if (!ObjectId.isValid(leadId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid lead id');
    }

    const lead = await Leads.findById(leadId);
    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
    }

    // Initialize KYC details if not exists
    if (!lead.kyc_details) {
      lead.kyc_details = {};
    }

    // Update KYC details
    Object.assign(lead.kyc_details, kycData);
    lead.kyc_details.submittedAt = new Date();

    await lead.save();

    return lead.kyc_details;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error creating KYC enrollment');
  }
};

const updateKycEnrollment = async (leadId, updateBody) => {
  if (!ObjectId.isValid(leadId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid lead id');
  }

  try {
    const lead = await Leads.findById(leadId);
    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
    }

    // Initialize KYC details if not exists
    if (!lead.kyc_details) {
      lead.kyc_details = {};
    }

    // Update KYC details
    Object.assign(lead.kyc_details, updateBody);

    await lead.save();

    return lead.kyc_details;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error updating KYC enrollment');
  }
};

const submitKycEnrollment = async (leadId, submitBody) => {
  if (!ObjectId.isValid(leadId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid lead id');
  }

  try {
    const lead = await Leads.findById(leadId);
    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
    }

    // Validate required fields
    const validationErrors = validateKycData(submitBody);
    if (validationErrors.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Validation errors: ${validationErrors.join(', ')}`);
    }

    // Initialize KYC details if not exists
    if (!lead.kyc_details) {
      lead.kyc_details = {};
    }

    // Update KYC details
    Object.assign(lead.kyc_details, submitBody);
    lead.kyc_details.isComplete = true;
    lead.kyc_details.submittedAt = new Date();

    await lead.save();

    // Send notification email (optional)
    // await sendKycCompletionNotification(lead);

    return {
      success: true,
      message: 'KYC enrollment submitted successfully',
      kycDetails: lead.kyc_details
    };
  } catch (error) {
    console.log(error)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error submitting KYC enrollment');
  }
};

const uploadKycDocuments = async (leadId, files) => {
  if (!ObjectId.isValid(leadId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid lead id');
  }

  try {
    const lead = await Leads.findById(leadId);
    if (!lead) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lead not found');
    }

    const uploadedUrls = [];

    for (const file of files) {
      const fileUrl = await uploadFilesToS3(file, 'kyc-documents');
      uploadedUrls.push(fileUrl);
    }

    return uploadedUrls;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error uploading KYC documents');
  }
};

const validateKycData = (kycData) => {
  const errors = [];

  // Required fields validation
  if (!kycData.clientType) {
    errors.push('Client type is required');
  }

  if (!kycData.fullName) {
    errors.push('Full name is required');
  }

  if (!kycData.email) {
    errors.push('Email is required');
  }

  if (!kycData.phone) {
    errors.push('Phone number is required');
  }

  if (!kycData.residentialAddress?.city) {
    errors.push('Residential address city is required');
  }

  if (!kycData.residentialAddress?.country) {
    errors.push('Residential address country is required');
  }

  // Company-specific validation
  if (kycData.clientType === 'company') {
    if (!kycData.ultimateBeneficialOwners || kycData.ultimateBeneficialOwners.length === 0) {
      errors.push('At least one Ultimate Beneficial Owner is required for companies');
    }

    if (!kycData.boardMembers || kycData.boardMembers.length === 0) {
      errors.push('At least one Board Member is required for companies');
    }
  }

  // Individual-specific validation
  if (kycData.clientType === 'individual') {
    if (!kycData.gender) {
      errors.push('Gender is required for individuals');
    }
  }

  // Financial information validation
  if (!kycData.financialInfo?.natureOfBusiness) {
    errors.push('Nature of business is required');
  }

  // Supporting documents validation
  if (kycData.clientType === 'individual') {
    if (!kycData.documents?.passport) {
      errors.push('Passport document is required');
    }
  } else if (kycData.clientType === 'company') {
    if (!kycData.documents?.certificate_of_incorporation) {
      errors.push('Certificate of incorporation document is required');
    }
    if (!kycData.documents?.authorized_signatory_id) {
      errors.push('Authorized signatory ID document is required');
    }
  }

  // Consent validation
  if (!kycData.consent?.dataProcessing) {
    errors.push('Data processing consent is required');
  }

  if (!kycData.consent?.regulatorySharing) {
    errors.push('Regulatory sharing consent is required');
  }

  if (!kycData.consent?.ongoingMonitoring) {
    errors.push('Ongoing monitoring consent is required');
  }

  if (!kycData.consent?.falseInformation) {
    errors.push('False information consent is required');
  }

  // Signature validation
  if (!kycData.signature?.signature) {
    errors.push('Signature is required');
  }

  if (!kycData.signature?.fullName) {
    errors.push('Signature full name is required');
  }

  if (!kycData.signature?.date) {
    errors.push('Signature date is required');
  }

  if (!kycData.signature?.place) {
    errors.push('Signature place is required');
  }

  return errors;
};

module.exports = {
  getKycEnrollmentByLeadId,
  createKycEnrollment,
  updateKycEnrollment,
  submitKycEnrollment,
  uploadKycDocuments
};
