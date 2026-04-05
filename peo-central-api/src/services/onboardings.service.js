const { ObjectId } = require('mongodb');
const { Onboardings, Documents, DocumentTypes } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const pagination = require('../middlewares/paginate');
const Emails = require('../middlewares/email');

const moment = require('moment-timezone');
const emailTemplateService = require('./email_template.service');
const queryService = require('./query.service');
const { toLower } = require('lodash');
const { sendEmail, sendRawEmail } = require('../middlewares/email');
const { EmailLog } = require('../models');
const { VisaProcess } = require('../models');
const { Processes } = require('../models');
const { Users, Companies } = require('../models');
const { DocumentTemplatesClone } = require('../models');
const { DocumentTemplate } = require('../models');

const _ = require('lodash');

const createOnboardings = async (onboardingBody, employeeDetails, assignedInsuranceAgent) => {
  try {
    let newOnboarding = new Onboardings(onboardingBody);
    const onboardingDoc = await newOnboarding.save();

    // Notify Assigned Insurance agent and Client
    if (onboardingDoc) {
      var emailTemplt = await emailTemplateService.getEmailTemplateByName({
        templateName: 'Notify Assigned Insurance Agent'
      });
      emailTemplt.content = emailTemplt.content.replace('[assigned_insurance_agent]', assignedInsuranceAgent?.full_name);
      emailTemplt.content = emailTemplt.content.replace('[employee_first_name]', employeeDetails?.first_name);
      emailTemplt.content = emailTemplt.content.replace('[employee_last_name]', employeeDetails?.last_name);
      emailTemplt.content = emailTemplt.content.replace('[company_name]', employeeDetails?.company_name);

      // await sendRawEmail(assignedInsuranceAgent.email, emailTemplt.subject, emailTemplt.content, [], [] );

      const clientEmailTemplt = await emailTemplateService.getEmailTemplateByName({
        templateName: 'Client Notification (New Onboarding)'
      });
      clientEmailTemplt.content = clientEmailTemplt.content.replace(
        '[employee_name]',
        `${employeeDetails?.first_name} ${employeeDetails?.last_name}`
      );
      clientEmailTemplt.content = clientEmailTemplt.content.replace('[employment_type]', employeeDetails?.employment_type);
      clientEmailTemplt.content = clientEmailTemplt.content.replace('[employee_email]', employeeDetails?.email);
      clientEmailTemplt.content = clientEmailTemplt.content.replace('[client_name]', employeeDetails?.company_name);
      // await sendRawEmail(employeeDetails.company_email, clientEmailTemplt.subject, clientEmailTemplt.content, clientEmailTemplt.cc, [] );
    }

    return onboardingDoc;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const updateOnboardingsOnId = async (onboardingId, onboardingBody) => {
  const onboardingsResult = await onboardingsById(onboardingId);
  if (!onboardingsResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Onboardings Not found');
  }
  return Onboardings.findOneAndUpdate({ _id: onboardingId }, { $set: onboardingBody }, { new: true });
};

const updateUpdatedBy = async (onboardingId, userId) => {
  return Onboardings.findOneAndUpdate({ _id: onboardingId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (onboardingId, userId) => {
  return Onboardings.findOneAndUpdate({ _id: onboardingId }, { $set: { created_by: userId } });
};

const listAllOnboardings = async () => {
  const query = { is_deleted: false };
  const options = { limit: 50, sort: { createdAt: -1 } };
  const onboardings = await Onboardings.find(query, null, options).lean();
  // console.log(onboardings.length);
  if (onboardings == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
  }
  return onboardings;
};

const getOnboardings = async (companyId, page, limit) => {
  let match = {
    is_deleted: false
  };

  let options = {
    page,
    limit
  };

  if (companyId) {
    match = {
      is_deleted: false,
      company_id: companyId
    };
  }

  let body = [
    {
      $project: {
        user_id: 1,
        company_id: 1
      }
    },
    {
      $lookup: {
        from: 'users',
        let: {
          userid: '$user_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$userid'] }]
              }
            }
          },
          {
            $project: {
              userName: {
                $concat: ['$first_name', ' ', '$last_name']
              },
              image_url: 1
            }
          }
        ],
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'companies',
        let: {
          companyId: '$company_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$companyId'] }]
              }
            }
          },
          {
            $project: {
              company_name: 1
            }
          }
        ],
        as: 'company'
      }
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true
      }
    }
  ];

  const onboardings = await Onboardings.paginateLookup(match, options, body);

  if (onboardings == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
  }
  return onboardings;
};

const onboardingsById = async onboardingId => {
  try {
    // Fetch the onboarding document
    let onboardings = await Onboardings.findById(onboardingId);
    if (!onboardings) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
    }

    // Create a deep copy of the processes to work with
    const updatedProcesses = JSON.parse(JSON.stringify(onboardings.processes));

    // Process each process in the onboardings
    for (let i = 0; i < updatedProcesses.length; i++) {
      const process = updatedProcesses[i];

      // Initialize attachments array for this process if it doesn't exist
      process.attachments = process.attachments || [];

      // Check if the process has actions with required documents
      if (process.actions && process.actions.length > 0) {
        for (const action of process.actions) {
          if (action.required_documents && action.required_documents.length > 0) {
            // Convert string IDs to ObjectId if necessary
            const documentTypeIds = action.required_documents.map(id => (ObjectId.isValid(id) ? ObjectId(id) : id));

            // Lookup documents that match the required document types and foreign_id
            const documents = await Documents.find({
              type: { $in: documentTypeIds },
              foreign_id: ObjectId(onboardingId),
              is_deleted: false
            });

            // Add only new document URLs to the process attachments array
            for (const doc of documents) {
              if (doc.url && !process.attachments.includes(doc.url)) {
                process.attachments.push(doc.url);
              }
            }
          }
        }
      }
    }

    // Update the document with the modified processes
    const updatedOnboardings = await Onboardings.findByIdAndUpdate(
      onboardingId,
      {
        $set: { processes: updatedProcesses }
      },
      {
        new: true,
        runValidators: true
      }
    );

    console.log(updatedOnboardings, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    if (!updatedOnboardings) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Failed to update onboarding');
    }

    return updatedOnboardings;
  } catch (error) {
    console.error('Error in onboardingsById:==========>', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

const deleteOnboardings = async onboardingId => {
  let onboardings = await Onboardings.findByIdAndUpdate({ _id: ObjectId(onboardingId) }, { is_deleted: true });
  if (!onboardings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete Onboardings');
  }
  return onboardings;
};

const onboardingsOnUserIDWorking = async (userId, page, limit) => {
  const onboardings = await Onboardings.find({ is_deleted: false, user_id: userId });
  let onboardingsResult = pagination(onboardings, page, limit, ['_id']);
  // .skip(page > 0 ? ((page - 1) * limit) : 0)
  // .limit(limit);
  if (onboardings == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
  }
  return onboardingsResult;
};

const onboardingsOnUserID = async (userId, page, limit) => {
  try {
    const onboardings = await Onboardings.find({ is_deleted: false, user_id: userId });

    if (onboardings.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
    }

    /**
     * Handle case for employee sign required on process flow
     * This functionality should handle the case where employee is required to sign a document previously uploaded
     * All stages on onboarding, renewal and offboarding should have this checked
     */
    const updatedProcesses = JSON.parse(JSON.stringify(onboardings[0].processes));

    for (let i = 0; i < updatedProcesses.length; i++) {
      const process = updatedProcesses[i];

      // Initialize attachments array for this process if it doesn't exist
      process.attachments = process.attachments || [];

      // Check if the current stage is "Employee's Sign"
      if (process.stage_name === "Employee's Sign") {
        const employmentContractDoc = await DocumentTypes.findOne({ name: 'Employment Contract' });
        if (!employmentContractDoc) throw new Error('could not find employment contract template');
        const previouslyUploadedDoc = await Documents.findOne(
          {
            foreign_id: ObjectId(onboardings[0]._id),
            is_deleted: false,
            type: employmentContractDoc._id
          },
          {},
          {
            sort: { _id: -1 }
          }
        );

        if (previouslyUploadedDoc && previouslyUploadedDoc.url) {
          if (!process.attachments.includes(previouslyUploadedDoc.url)) {
            process.attachments.unshift(previouslyUploadedDoc.url);
          }
        }
      }

      if (process.actions && process.actions.length > 0) {
        for (const action of process.actions) {
          if (action.required_documents && action.required_documents.length > 0) {
            const documentTypeIds = action.required_documents.map(id => (ObjectId.isValid(id) ? ObjectId(id) : id));

            const documents = await Documents.find({
              type: { $in: documentTypeIds },
              foreign_id: ObjectId(onboardings[0]._id),
              is_deleted: false
            });

            for (const doc of documents) {
              if (doc.url && !process.attachments.includes(doc.url)) {
                process.attachments.push(doc.url);
              }
            }
          }
        }
      }
    }

    const updatedOnboardings = await Onboardings.findByIdAndUpdate(
      onboardings[0]._id,
      {
        $set: { processes: updatedProcesses }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedOnboardings) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Failed to update onboarding');
    }

    // Apply pagination
    const onboardingsResult = pagination([updatedOnboardings], page, limit, ['_id']);
    return onboardingsResult;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const onboardingsOnStageID = async (stageId, page, limit) => {
  const onboardings = await Onboardings.find({ is_deleted: false, stage_id: stageId });
  let onboardingsResult = pagination(onboardings, page, limit, ['_id']);
  // .skip(page > 0 ? ((page - 1) * limit) : 0)
  // .limit(limit);
  if (onboardings == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
  }
  return onboardingsResult;
};

const onboardingsOnStatus = async status => {
  let onboardings = await Onboardings.find({ status: status });
  if (!onboardings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
  }
  return onboardings;
};

const filterOnDatesStatusAndStageTypes = async (reqBody, page, limit) => {
  const query = { is_deleted: false };
  if (reqBody.start_date && reqBody.end_date) {
    const endDate = new Date(reqBody.end_date);
    endDate.setDate(endDate.getDate() + 1);
    query.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
  }
  if (reqBody.status) {
    if (Array.isArray(reqBody.status)) {
      query.status = { $in: reqBody.status };
    } else {
      query.status = reqBody.status;
    }
  }
  if (reqBody.stage_type) {
    if (Array.isArray(reqBody.stage_type)) {
      query.stage_type = { $in: reqBody.stage_type };
    } else {
      query.stage_type = reqBody.stage_type;
    }
  }
  let onboardings = await Onboardings.find(query);
  let onboardingsResult = pagination(onboardings, page, limit, ['_id']);
  if (onboardings.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Any Onboardings');
  }
  return onboardingsResult;
};

const listOfUsersAndCompaniesWithStatus = async (reqBody, page, limit) => {
  let pipeline = [
    {
      $match: {
        is_deleted: false
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $unwind: '$userDetails'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'assigned_support_agent',
        foreignField: '_id',
        as: 'supportAgentDetails'
      }
    },
    {
      $unwind: {
        path: '$supportAgentDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        status: 1,
        stage_type: 1,
        createdAt: 1,
        first_name: '$userDetails.first_name',
        middle_name: '$userDetails.middle_name',
        last_name: '$userDetails.last_name',
        image_url: '$userDetails.image_url',
        company_name: '$companyDetails.company_name',
        support_agent: {
          $cond: {
            if: { $ne: ['$supportAgentDetails', null] },
            then: {
              $concat: [
                { $ifNull: ['$supportAgentDetails.first_name', ''] },
                {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ['$supportAgentDetails.middle_name', null] },
                        { $ne: ['$supportAgentDetails.middle_name', ''] }
                      ]
                    },
                    then: { $concat: [' ', '$supportAgentDetails.middle_name'] },
                    else: ''
                  }
                },
                {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ['$supportAgentDetails.last_name', null] },
                        { $ne: ['$supportAgentDetails.last_name', ''] }
                      ]
                    },
                    then: { $concat: [' ', '$supportAgentDetails.last_name'] },
                    else: ''
                  }
                }
              ]
            },
            else: 'No Support Agent Assigned'
          }
        }
      }
    }
  ];
  if (reqBody.selected_company_id) {
    pipeline.unshift(...queryService(reqBody));
  }
  if (reqBody.status) {
    if (Array.isArray(reqBody.status)) {
      pipeline.push({ $match: { status: { $in: reqBody.status } } });
    } else {
      pipeline.push({ $match: { status: reqBody.status } });
    }
  }

  if (reqBody.stage_type) {
    if (Array.isArray(reqBody.stage_type)) {
      pipeline.push({ $match: { stage_type: { $in: reqBody.stage_type } } });
    } else {
      pipeline.push({ $match: { stage_type: reqBody.stage_type } });
    }
  }

  if (reqBody.start_date && reqBody.end_date) {
    const endDate = new Date(reqBody.end_date);
    endDate.setDate(endDate.getDate() + 1);
    pipeline.push({
      $match: {
        createdAt: { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) }
      }
    });
  }
  if (reqBody.search) {
    const searchRegex = new RegExp(reqBody.search, 'i');
    pipeline.push({
      $match: {
        $or: [
          { company_name: searchRegex },
          { first_name: searchRegex },
          { middle_name: searchRegex },
          { last_name: searchRegex },
          { status: searchRegex }
        ]
      }
    });
  }
  let onboardings = await Onboardings.aggregate(pipeline);
  if (!onboardings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
  }
  let onboardingsResult = pagination(onboardings, page, limit, ['_id']);
  return onboardingsResult;
};

const extendedListOfUsersAndCompaniesone = async onboardingId => {
  let pipeline = [
    {
      $match: {
        _id: ObjectId(onboardingId)
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $unwind: '$userDetails'
    },
    {
      $lookup: {
        from: 'documents',
        localField: '_id',
        foreignField: 'foreign_id',
        as: 'attachedDocuments'
      }
    },
    {
      $unwind: {
        path: '$attachedDocuments',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'documents_types',
        localField: 'attachedDocuments.type',
        foreignField: '_id',
        as: 'documentTypes'
      }
    },
    {
      $unwind: {
        path: '$documentTypes',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        status: 1,
        stage_type: 1,
        processes: 1,
        user_location: 1,
        vip: 1,
        visa_type: 1,
        createdAt: 1,
        user_id: 1,
        first_name: '$userDetails.first_name',
        middle_name: '$userDetails.middle_name',
        visa_sponsor: '$userDetails.employment.visa_sponsor_type',
        visa_sponsor: '$userDetails.employment.visa_sponsor_type',
        visa_sponsor: '$userDetails.employment.visa_sponsor_type',
        last_name: '$userDetails.last_name',
        email: '$userDetails.email',
        designation: '$userDetails.employment.designation',
        contact_number: '$userDetails.contact_number',
        contract_type: '$userDetails.employment.contract_type',
        employment_type: '$userDetails.employment.employment_type',
        process_type: '$userDetails.process_type',
        date_of_joining: '$userDetails.date_of_joining',
        phone: '$userDetails.phone',
        emp_id: '$userDetails.emp_id',
        personal: '$userDetails.personal',
        employment: '$userDetails.employment',
        place_of_registration: '$userDetails.place_of_registration',
        dependent_details: '$userDetails.dependent_details',
        payroll_details: '$userDetails.payroll_details',
        salary: '$userDetails.salary',
        user_image_url: '$userDetails.image_url',
        company_name: '$companyDetails.company_name',
        company_legal_name: '$companyDetails.legal_name',
        company_registration_number: '$companyDetails.registration_number',
        company_logo: '$companyDetails.logo',
        company_phone: '$companyDetails.phone',
        company_email: '$companyDetails.email',
        company_address: '$companyDetails.address',
        company_country: '$companyDetails.country',
        company_website: '$companyDetails.website',
        company_locations: '$companyDetails.locations'
        // documents:"$attachedDocuments"
      }
    }
  ];
  let onboardings = await Onboardings.aggregate(pipeline);
  if (!onboardings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
  }
  return onboardings;
};
const extendedListOfUsersAndCompanies = async onboardingId => {
  let pipeline = [
    {
      $match: {
        _id: ObjectId(onboardingId)
      }
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $lookup: {
        from: 'renewals',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'renewalDetails'
      }
    },
    {
      $unwind: {
        path: '$renewalDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'visa_process',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'visaProcessDetails'
      }
    },
    {
      $unwind: {
        path: '$visaProcessDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'offboardings',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'offboardingDetails'
      }
    },
    {
      $unwind: {
        path: '$offboardingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'documents',
        let: {
          userId: '$user_id',
          onboardingId: '$_id',
          renewalIds: '$renewalDetails._id',
          visaProcessIds: '$visaProcessDetails._id',
          offboardingIds: '$offboardingDetails._id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  // Direct user documents
                  { $eq: ['$foreign_id', '$$userId'] },
                  // Documents linked through this onboarding
                  {
                    $and: [
                      { $eq: ['$module', 'onboardings'] },
                      { $eq: ['$foreign_id', '$$onboardingId'] }
                    ]
                  },
                  // Documents linked through renewals
                  {
                    $and: [
                      { $eq: ['$module', 'renewals'] },
                      { $ne: ['$$renewalIds', null] },
                      { $eq: ['$foreign_id', '$$renewalIds'] }
                    ]
                  },
                  // Documents linked through visa processes
                  {
                    $and: [
                      { $eq: ['$module', 'visa process'] },
                      { $ne: ['$$visaProcessIds', null] },
                      { $eq: ['$foreign_id', '$$visaProcessIds'] }
                    ]
                  },
                  // Documents linked through offboardings
                  {
                    $and: [
                      { $eq: ['$module', 'offboardings'] },
                      { $ne: ['$$offboardingIds', null] },
                      { $eq: ['$foreign_id', '$$offboardingIds'] }
                    ]
                  }
                ]
              },
              is_deleted: false
            }
          }
        ],
        as: 'attachedDocuments'
      }
    },
    {
      $lookup: {
        from: 'document_types',
        let: { documentTypes: '$attachedDocuments.type' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', { $map: { input: '$$documentTypes', as: 'type', in: { $toObjectId: '$$type' } } }]
              },
              is_deleted: false
            }
          }
        ],
        as: 'documentTypes'
      }
    },
    {
      $addFields: {
        companyDetails: { $arrayElemAt: ['$companyDetails', 0] }, // Convert companyDetails to object
        userDetails: { $arrayElemAt: ['$userDetails', 0] } // Convert userDetails to object
      }
    },
    {
      $project: {
        _id: 1,
        status: 1,
        stage_type: 1,
        processes: 1,
        user_location: 1,
        vip: 1,
        visa_type: 1,
        createdAt: 1,
        user_id: 1,
        first_name: '$userDetails.first_name',
        middle_name: '$userDetails.middle_name',
        last_name: '$userDetails.last_name',
        email: '$userDetails.email',
        designation: '$userDetails.employment.designation',
        contact_number: '$userDetails.contact_number',
        contract_type: '$userDetails.employment.contract_type',
        employment_type: '$userDetails.employment.employment_type',
        process_type: '$userDetails.process_type',
        date_of_joining: '$userDetails.date_of_joining',
        phone: '$userDetails.phone',
        emp_id: '$userDetails.emp_id',
        personal: '$userDetails.personal',
        employment: '$userDetails.employment',
        bank: '$userDetails.bank',
        image_url: '$userDetails.image_url',
        insurance: '$userDetails.insurance',
        emergency: '$userDetails.emergency',
        emergency_uae: '$userDetails.emergency_uae',
        residencyLastUpdated: '$userDetails.residencyLastUpdated',
        probation_period: '$userDetails.probation_period',
        place_of_registration: '$userDetails.place_of_registration',
        dependent_details: '$userDetails.dependent_details',
        payroll_details: '$userDetails.payroll_details',
        salary: '$userDetails.salary',
        nonwps_salary: '$userDetails.nonwps_salary',
        user_image_url: '$userDetails.image_url',
        company_name: '$companyDetails.company_name',
        company_legal_name: '$companyDetails.legal_name',
        company_registration_number: '$companyDetails.registration_number',
        company_logo: '$companyDetails.logo',
        company_phone: '$companyDetails.phone',
        company_email: '$companyDetails.email',
        company_address: '$companyDetails.address',
        company_country: '$companyDetails.country',
        company_website: '$companyDetails.website',
        company_locations: '$companyDetails.locations',
        attachedDocuments: { $ifNull: ['$attachedDocuments', []] },
        documentTypes: { $ifNull: ['$documentTypes', []] }
      }
    }
  ];

  let onboardings = await Onboardings.aggregate(pipeline);
  if (!onboardings || onboardings.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Onboardings');
  }
  for (let process of onboardings[0].processes) {
    if (process.stage_name.toLowerCase() == 'create employment contract') {
      // loop through attached documents
      for (let document of onboardings[0].attachedDocuments) {
        if (document.name.includes('Employment_Contract')) {
          process.attachments = process.attachments || [];
          if (process.attachments.length < 1) {
            process.attachments.push(document);
          }
        }
      }
    } else if (process.stage_name.toLowerCase() == 'create work order') {
      // loop through attached documents
      for (let document of onboardings[0].attachedDocuments) {
        if (document.name.includes('New_Work_Permit') || document.name.includes('Work_Order')) {
          process.attachments = process.attachments || [];
          if (process.attachments.length < 1) {
            process.attachments.push(document);
          }
        }
      }
    } else if (process.stage_name.toLowerCase() == 'work order sign') {
      const signedWorkOrderDocType = await DocumentTypes.findOne({ name: 'signed work Order' });
      process.attachments = process.attachments || [];
      if (process.attachments && process.attachments.every(item => typeof item !== 'object')) {
        for (let document of onboardings[0].attachedDocuments) {
          if (signedWorkOrderDocType._id.equals(document.type)) {
            process.attachments = [];
            process.attachments.push(document);
          }
        }
      }
    } else if (process.stage_name.toLowerCase() == `employee's sign`) {
      // get sign internal employment contract document type
      const signedInternalContractDocType = await DocumentTypes.findOne({ name: 'Signed Internal Employment Contract' });
      console.log(signedInternalContractDocType._id, 'this is the fetched id');
      const uploadedDoc = await Documents.find({
        foreign_id: ObjectId(onboardings[0]._id),
        is_deleted: false,
        type: signedInternalContractDocType._id
      })
        .sort({ created_at: -1 })
        .limit(1);
      process.attachments = process.attachments ? process.attachments : [];
      if (process.attachments && process.attachments.every(item => typeof item !== 'object') && uploadedDoc.length > 0) {
        process.attachments.push(uploadedDoc[0]);
      }
    }
  }
  return onboardings;
};

const onboardingProcessForward = async (reqBody, onboardingId, userId) => {
  const onboardingsResult = await onboardingsById(onboardingId);
  if (!onboardingsResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }

  const filter_progress_process_status = {
    _id: ObjectId(onboardingId),
    'processes.process_status': 'progress'
  };

  const docs = await Onboardings.find(filter_progress_process_status);

  const resultPromises = docs.map(async doc => {
    for (let index = 0; index < doc.processes.length; index++) {
      const process = doc.processes[index];

      if (process.process_status === 'progress' && process.actions.length > 0) {
        let allActionsCompleted = true;

        for (const action of process.actions) {
          if (action.status === 'progress') {
            if (toLower(action.action_type) === 'no action') {
              console.log('action type UPDATE ==> ', action);
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }

            if (toLower(action.action_type) === 'document') {
              console.log('action type DOCUMENT ==> ', action);
              //----GET THE DOCUMENTS ON THE TEMPLATE ID
              //----GENERATE THE DOCUMENT
              //----UPLOAD THE GENERATED DOCUMENT SOMEWHERE
              // if(documentUpdatables) {
              //   const updateOnboardings = await Onboardings.updateOne({ "_id": ObjectId(onboardingId) }, { $set: reqBody.documentUpdatables }, { new: true });
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
              // }
            }

            if (toLower(action.action_type) === 'email') {
              console.log('action type EMAIL ==> ', action);
              //----GET THE EMAIL TEMPLATE FROM THE TEMPLATE ID
              let emailBody = {
                to: reqBody.to,
                cc: reqBody.cc,
                subject: reqBody.subject,
                body: reqBody.body
              };

              if (emailBody) {
                await sendEmail(emailBody.to, emailBody.subject, emailBody.body, emailBody.cc);
                // await new EmailLog(emailBody).save();
                action.updated_by = userId;
                action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
                action.status = 'completed';
                doc.status = process.stage_name;
              }
            }

            if (toLower(action.action_type) === 'create new visa process') {
              let docCloneIds = [];
              console.log('action type CREATE NEW VISA PROCESS ==> ', action);
              let processArray = await Processes.find({ process_name: 'new visa process' });
              let onboardingVisaProcessBody = {
                user_id: onboardingsResult.user_id,
                company_id: onboardingsResult.company_id,
                process_type: 'new visa process',
                status: 'mol offer letter',
                attachments: onboardingsResult.attachments,
                comments: onboardingsResult.comments,
                processes: processArray[0].stages,
                created_by: userId
              };
              const documents = processArray[0].stages.map(async process => {
                const documentActions = process.actions.filter(async action => {
                  if (action.action_type === 'document') {
                    let document_template = await DocumentTemplate.findById({ _id: ObjectId(action.template_id) });
                    const template = document_template;
                    template.auto_replace_keys.forEach(async replaceKeys => {
                      replaceKeys.fk_id = '';
                    });
                    let templateBody = {
                      auto_replace_keys: template.auto_replace_keys,
                      user_input_keys: template.user_input_keys,
                      name: template.name,
                      content: template.content,
                      module: template.module
                    };
                    const create_document_template_clone = await new DocumentTemplatesClone(templateBody).save();
                    action.template_id = create_document_template_clone._id;
                    docCloneIds.push({ _id: create_document_template_clone._id });
                    onboardingVisaProcessBody.processes = processArray[0].stages;
                    return true;
                  }
                  return false;
                });

                if (documentActions.length > 0) {
                  return process;
                }
              });

              let newVisaProcess = await new VisaProcess(onboardingVisaProcessBody).save();
              await DocumentTemplatesClone.updateMany(
                { _id: { $in: docCloneIds } },
                { $set: { module_id: newVisaProcess._id } }
              );

              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              process.process_status = 'completed';
              doc.status = 'active';
              const user_active = await Users.updateOne(
                { _id: ObjectId(onboardingResult.user_id) },
                { $set: { user_status: 'active' } }
              );
            }
            if (toLower(action.action_type) === 'invoice creation' || toLower(action.action_type) === 'record payment') {
              console.log('action type INVOICE CREATION OR RECORD PAYMENT ==> ', action);
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
            }
          }

          if (action.status !== 'completed') {
            allActionsCompleted = false;
          }
        }

        if (allActionsCompleted && doc.processes.length == index + 1) {
          process.process_status = 'completed';
          doc.status = 'completed';
        }

        if (allActionsCompleted && doc.processes.length != index + 1) {
          process.process_status = 'completed';
          doc.processes[index + 1].process_status = 'progress';

          if (doc.processes[index + 1].actions.length > 0) {
            doc.processes[index + 1].actions[0].status = 'progress';
          }
        } else {
          for (const action of process.actions) {
            if (action.status === 'pending' && toLower(reqBody.button) != 'create invoice') {
              action.status = 'progress';
              break;
            }
          }
        }

        break;
      }

      if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
        process.process_status = 'completed';
        doc.status = toLower(process.stage_name);
        process.actions = [
          {
            updated_by: userId,
            updated_date_time: moment.tz('UTC').tz('Asia/Dubai').format(),
            status: 'completed'
          }
        ];

        if (doc.processes.length != index + 1) {
          doc.processes[index + 1].process_status = 'progress';

          if (doc.processes[index + 1].actions.length > 0) {
            doc.processes[index + 1].actions[0].status = 'progress';
          }
        }

        break;
      }
    }

    const updated_onboarding_process = await Onboardings.updateOne(
      { _id: ObjectId(onboardingId) },
      { $set: { processes: doc.processes, status: doc.status } }
    );
    return doc;
  });

  const result = await Promise.all(resultPromises);
  return result[0];
};

const onboardingProcessBackward = async onboardingId => {
  const filter_progress_process_status = { _id: ObjectId(onboardingId), 'processes.process_status': 'progress' };
  let result = [];
  await Onboardings.find(filter_progress_process_status).then(docs => {
    docs.forEach(async doc => {
      for (let index = doc.processes.length - 1; index >= 0; index--) {
        const process = doc.processes[index];
        if (process.process_status === 'progress' && process.actions.length > 0) {
          let allActionsCompleted = true;
          for (let action_index = 0; action_index < process.actions.length; action_index++) {
            const action = process.actions[action_index];
            if (action.status === 'completed') {
              action.status = 'progress';
              break; // Exit the loop after updating the status of one action
            }
            if (action.status !== 'pending') {
              allActionsCompleted = false;
            }
          }

          if (allActionsCompleted && doc.processes.length != index - 1) {
            process.process_status = 'pending';
            doc.processes[index - 1].process_status = 'progress';
            if (doc.processes[index - 1].actions.length > 0) {
              doc.processes[index - 1].actions[0].status = 'progress';
            }
          } else {
            for (let i = 0; i < process.actions.length; i++) {
              const action = process.actions[i];
              if (action.status === 'progress') {
                action.status = 'pending';
                break;
              }
            }
          }
          break;
        }
        if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
          process.process_status = 'pending';
          if (doc.processes.length != index - 1) {
            doc.processes[index - 1].process_status = 'progress';
            if (doc.processes[index - 1].actions.length > 0) {
              const action_length = doc.processes[index - 1].actions.length;
              doc.processes[index - 1].actions[action_length - 1].status = 'progress';
            }
          }
          break;
        }
      }
      result = doc.processes;
      const updated_process = await Onboardings.updateOne(
        { _id: ObjectId(onboardingId) },
        { $set: { processes: doc.processes } }
      );
    });
  });
  return result;
};
const getOnboardingStatusCount = async reqBody => {
  try {
    // Build base match criteria
    let matchCriteria = {
      is_deleted: false,
      stage_type: 'onboarding'
    };

    // Add company filter if provided
    if (reqBody.selected_company_id) {
      matchCriteria.company_id = {
        $in: reqBody.selected_company_id.map(id => ObjectId(id))
      };
    }

    // Main pipeline to count onboardings by their overall status (INCLUDE inactive users, EXCLUDE orphaned records)
    let pipeline = [
      { $match: matchCriteria },
      // Add user lookup to exclude orphaned records (onboardings without valid users)
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'  // This excludes orphaned records (no preserveNullAndEmptyArrays)
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    // Get counts by status (total counts including inactive users)
    let getCount = await Onboardings.aggregate(pipeline);

    // Get inactive user counts for each status (for transparency)
    let inactivePipeline = [
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $match: {
          'userDetails.user_status': 'inactive'
        }
      },
      {
        $group: {
          _id: '$status',
          inactiveCount: { $sum: 1 }
        }
      }
    ];
    let inactiveCounts = await Onboardings.aggregate(inactivePipeline);

    // Get withdrawn/unsuccessful applications separately (INCLUDE inactive users, EXCLUDE orphaned records)
    const withdrawPipeline = [
      {
        $match: {
          status: { $in: ['Withdraw', 'unsuccessful'] },
          is_deleted: false,
          stage_type: 'onboarding',
          ...(reqBody.selected_company_id && {
            company_id: { $in: reqBody.selected_company_id.map(id => ObjectId(id)) }
          })
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'  // Exclude orphaned records
      }
    ];
    let withdrawApplications = await Onboardings.aggregate(withdrawPipeline);

    // Add withdraw count
    getCount.push({
      _id: 'Withdraw',
      count: withdrawApplications.length
    });

    // Get process stages for ordering - show ALL stages, even with 0 count
    let process = await Processes.findOne({ is_deleted: false, process_name: 'onboarding process' });
    let order = process ? process.stages.map(a => a.stage_name) : [];

    order.push('Withdraw');

    // Create a complete result set with all stages, filling in 0 for missing ones
    let completeResults = [];

    // Add all stages from process definition
    for (const stageName of order) {
      const existingCount = getCount.find(item => item._id === stageName);
      const inactiveCount = inactiveCounts.find(item => item._id === stageName);

      completeResults.push({
        _id: stageName,
        count: existingCount ? existingCount.count : 0,           // Total count (including inactive)
        inactiveCount: inactiveCount ? inactiveCount.inactiveCount : 0,  // Inactive count for transparency
        activeCount: existingCount ? existingCount.count - (inactiveCount ? inactiveCount.inactiveCount : 0) : 0  // Active count
      });
    }

    // Sort results according to process stage order
    let getCountOrder = _.sortBy(
      completeResults,
      function (obj) {
        return _.indexOf(order, obj._id);
      }
    );

    // Calculate Total as sum of all individual counts (excluding Total itself)
    let totalCount = getCountOrder.reduce((sum, item) => {
      return sum + item.count;
    }, 0);

    // Add Total count at the end
    getCountOrder.push({
      _id: 'Total',
      count: totalCount,
      inactiveCount: 0,  // Total doesn't need inactive breakdown
      activeCount: totalCount
    });

    return getCountOrder;
  } catch (error) {
    throw new Error(error);
  }
};

const getOnboardingStatusCounttest = async () => {
  let documentCreated = {
    $sum: {
      $cond: [
        {
          $and: [{ $eq: ['$processes.stage_name', 'Employee Details'] }, { $eq: ['$processes.process_status', 'progress'] }]
        },
        1,
        0
      ]
    }
  };

  let totalEmployersApproval = {
    $sum: {
      $cond: [
        {
          $and: [{ $eq: ['$processes.stage_name', "Employee's Sign"] }, { $eq: ['$processes.process_status', 'progress'] }]
        },
        1,
        0
      ]
    }
  };

  let totalEmployeesApproval = {
    $sum: {
      $cond: [
        {
          $and: [{ $eq: ['$processes.stage_name', 'Create Work Order'] }, { $eq: ['$processes.process_status', 'progress'] }]
        },
        1,
        0
      ]
    }
  };

  let InvoiceNotCreated = {
    $sum: {
      $cond: [
        {
          $and: [
            { $eq: ['$processes.stage_name', 'Invoice & Debit Note'] },
            { $eq: ['$processes.process_status', 'progress'] },
            { $eq: ['$processes.actions.button', 'create'] },
            { $eq: ['$processes.actions.status', 'progress'] }
          ]
        },
        1,
        0
      ]
    }
  };

  let waitingForPayment = {
    $sum: {
      $cond: [
        {
          $and: [
            { $eq: ['$processes.stage_name', 'Invoice & Debit Note'] },
            { $eq: ['$processes.actions.status', 'progress'] },
            { $eq: ['$processes.actions.button', 'Record'] },
            { $eq: ['$processes.actions.status', 'progress'] }
          ]
        },
        1,
        0
      ]
    }
  };

  let group = {
    $group: {
      _id: null,
      documentCreated,
      totalEmployersApproval,
      totalEmployeesApproval,
      InvoiceNotCreated,
      waitingForPayment
    }
  };

  let unwind_process = { $unwind: '$processes' };

  let unwind_actions = {
    $unwind: {
      path: '$processes.actions',
      preserveNullAndEmptyArrays: true
    }
  };

  let getCount = await Onboardings.aggregate([unwind_process, unwind_actions, group]);

  let ActiveVisaProcess = {
    $sum: {
      $cond: [
        {
          $and: [{ $eq: ['$status', 'active'] }]
        },
        1,
        0
      ]
    }
  };
  let group_ = {
    $group: {
      _id: null,
      totalOnboarding: { $sum: 1 },
      ActiveVisaProcess
    }
  };
  let getCount_ = await Onboardings.aggregate([group_]);

  let total_count = getCount[0];

  total_count.totalOnboarding = getCount_[0].totalOnboarding;
  total_count.ActiveVisaProcess = getCount_[0].ActiveVisaProcess;

  delete total_count._id;

  return { total_count };
};

const getOnboardingPipeline = async reqBody => {
  // let pipeline_ = ['Employee Details', 'Create Employment contract', "Employer's Approval", "Employee's Sign", 'Create Work Order', 'Work Order Approval', "Invoice & Debit Note"]
  let stageList = await Processes.find({ module: 'onboardings' });
  const pipeline_ = stageList[0].stages.map(stage => stage.stage_name);
  let diff_status = [];
  for (let index = 0; index < pipeline_.length; index++) {
    const stage = pipeline_[index];

    let project = {
      $project: {
        _id: 0,
        days_since: {
          $toInt: { $divide: [{ $subtract: [new Date(), '$updatedAt'] }, 1000 * 60 * 60 * 24] }
        },
        processes: 1
      }
    };

    let unwind = { $unwind: '$processes' };

    let match_ = {
      $match: {
        'processes.stage_name': stage,
        'processes.process_status': 'progress'
      }
    };

    let group_ = {
      $group: {
        _id: '$processes.stage_name',
        count: { $sum: 1 },
        avgDays: { $avg: '$days_since' }
      }
    };

    let floorAvgDays = {
      $addFields: {
        avgDays: { $floor: '$avgDays' }
      }
    };
    let pipeline = [unwind, match_, project, group_, floorAvgDays];
    if (reqBody.selected_company_id) {
      pipeline.unshift(...queryService(reqBody));
    }

    let pipeline_status = await Onboardings.aggregate(pipeline);

    if (pipeline_status && pipeline_status.length) {
      diff_status.push(pipeline_status[0]);
    } else {
      let obj = {
        _id: stage,
        count: 0,
        avgDays: 0
      };

      diff_status.push(obj);
    }
  }

  return diff_status;
};

const getDiffPipelineList = async (query, page, limit) => {
  // let pipeline_ = ['Employee Details', 'Create Employment contract', 'Create Work Order', 'Work Order Approval']

  let filter = {
    processes: {
      $elemMatch: {
        stage_name: query.stage_name,
        process_status: 'progress'
      }
    }
  };

  let options = {
    page,
    limit
  };

  let body = [
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $project: {
        _id: 0,
        days_since: {
          $toInt: { $divide: [{ $subtract: [new Date(), '$updatedAt'] }, 1000 * 60 * 60 * 24] }
        },
        user_id: 1,
        company_name: '$companyDetails.company_name'
      }
    },
    {
      $lookup: {
        from: 'users',
        let: {
          userid: '$user_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$userid'] }]
              }
            }
          },
          {
            $project: {
              first_name: 1,
              last_name: 1,
              image_url: 1
            }
          }
        ],
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    }
  ];

  let onboardings = await Onboardings.paginateLookup(filter, options, body);

  return onboardings;
};

const listOfOnboardingStatus = async (query, reqBody) => {
  try {
    // Get process stages from the process definition
    let process = await Processes.findOne({ is_deleted: false, process_name: 'onboarding process' });
    const processStages = process ? process.stages.map(stage => stage.stage_name) : [];

    // Get actual status values from onboardings collection
    const distinctStatuses = await Onboardings.distinct('status', { is_deleted: false, stage_type: 'onboarding' });

    // Add common status values that might not be in the database yet
    const commonStatuses = ['Withdraw', 'unsuccessful', 'completed'];

    // Combine process stages, actual statuses, and common statuses
    const combinedArray = [...processStages, ...distinctStatuses, ...commonStatuses];
    const uniqueArray = Array.from(new Set(combinedArray.filter(status => status && status.trim() !== '')));

    // Sort the array for better UX
    return uniqueArray.sort();
  } catch (error) {
    console.error('Error in listOfOnboardingStatus:', error);
    // Return fallback status list if there's an error
    return ['Employee Details', 'Create Employment contract', 'Employer\'s Approval', 'Employee\'s Sign', 'Create Work Order', 'Work Order Approval', 'Work Order Sign', 'Invoice & Debit Note', 'Withdraw', 'unsuccessful', 'completed'];
  }
};

const getApplicationDistribution = async processList => {
  let pipeline = [
    {
      $project: {
        status: 1
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];
  const distribution = await Onboardings.aggregate(pipeline);
  return distribution;
};

const notifyUser = async process => {
  const currentProcess = process.processes[0];

  if (currentProcess.status == 'completed') {
    let currentEmailAction = currentProcess.actions.filter(item => item.action_type == 'email');
    const trigger = async function (template_id, process_id) {
      const emailData = await emailTemplateService.getEmailTemplateOnIDWithoutContent(template_id, process_id);
      await Emails.sendEmail(emailData.to, emailData.subject, emailData.content, emailData.cc);
    };

    for (let index = 0; index < currentEmailAction.length; index++) {
      trigger(currentEmailAction[index].template_id, process._id);
    }
  }
};

const notifyAdmin = async (onboardingDoc, userDoc) => {
  try {
    const searchQuery = {
      templateName: 'Onboarding Received (Internal Notification)'
    };
    const companyDoc = await Companies.findOne({ _id: userDoc.company_id });
    if (!companyDoc) {
      throw new Error('invalid company id');
    }
    const emailTemplt = await emailTemplateService.getEmailTemplateByName(searchQuery);
    if (!emailTemplt) throw new Error('Email template not found. Could not send onboarding received notification');
    const reconstructedBody = {
      first_name: userDoc.first_name,
      last_name: userDoc.last_name,
      email: userDoc.email,
      company_name: companyDoc.company_name,
      company_email: companyDoc.email
    };
    // const emailData = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
    //   emailTemplt._id,
    //   onboardingDoc.company_id,
    //   userDoc.onboarding_id,
    //   reconstructedBody,
    //   (onboardingLink = false)
    // );
    let emailData = emailTemplt;
    if (emailData.content) {
      console.log('email data has content on document');
      if (emailData.content.includes('company_name')) {
        emailData.content = emailData.content.replace('company_name', companyDoc.company_name);
      }
      if (emailData.content.includes('company_email')) {
        emailData.content = emailData.content.replace('company_email', companyDoc.email);
      }
      if (emailData.content.includes('[employee_first_name]')) {
        emailData.content = emailData.content.replace('[employee_first_name]', userDoc.first_name);
      }
      if (emailData.content.includes('[employee_last_name]')) {
        emailData.content = emailData.content.replace('[employee_last_name]', userDoc.last_name);
      }
      if (emailData.content.includes('[employee_email]')) {
        emailData.content = emailData.content.replace('[employee_email]', userDoc.email);
      }
    }
    console.log('-------------------------------->', emailData, '<--------------------');
    const result = await Emails.sendEmail(emailData.to, emailData.subject, emailData.content, emailData.cc);
    return result; // Return the result of the sendEmail function
  } catch (error) {
    throw new Error(error);
  }
};

const getProcessDetailForInvoice = async invoiceId => {
  return await Onboardings.aggregate([{ $unwind: '$processes' }, { $match: { 'processes.invoice_id': invoiceId } }]);
};

const getInvoiceDocuments = async invoiceId => {
  console.log('print for invoice id', invoiceId);
  const process = await Onboardings.aggregate([
    { $unwind: '$processes' },
    { $match: { 'processes.invoice_id': invoiceId } }
  ]);

  if (process && process[0]) {
    var GenerateDocument = process[0].processes.actions.filter(elem => elem.action_type == 'invoice creation')[0];
    return await Documents.findOne({ _id: GenerateDocument.generated_document_id });
  }
};

const getOnboardingsOnCompanyId = async companyId => {
  try {
    const pipeline = [
      {
        $match: {
          is_deleted: false,
          company_id: ObjectId(companyId)
        }
      },
      {
        $sort: {
          _id: -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          user_id: 1,
          company_id: 1,
          stage_id: 1,
          processes: 1,
          is_unsuccessful: 1,
          reason_for_unsuccessful: 1,
          employment_contract: 1,
          process_type: 1,
          upfront_costs: 1,
          status: 1,
          'userDetails.employment.employment_type': 1 // Add employment type
        }
      }
    ];

    const onboardings = await Onboardings.aggregate(pipeline).exec();
    return onboardings;
  } catch (error) {
    throw new Error(error.message);
  }
};


const exportBulkUploadTemplate = async () => {
  try {
    const excelJs = require('exceljs');
    const moment = require('moment');
    const workbook = new excelJs.Workbook();
    workbook.creator = 'PEO Central';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Employee Bulk Upload Template', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    });

    const columns = [
      { header: 'First Name*', key: 'first_name', width: 25 },        // Column A (1)
      { header: 'Middle Name', key: 'middle_name', width: 25 },       // Column B (2)
      { header: 'Last Name*', key: 'last_name', width: 25 },          // Column C (3)
      { header: 'Email*', key: 'email', width: 30 },                  // Column D (4)
      { header: 'Phone', key: 'phone', width: 20 },                   // Column E (5)
      { header: 'Nationality', key: 'nationality', width: 20 },       // Column F (6)
      { header: 'Date of Birth', key: 'dob', width: 20 },             // Column G (7)
      { header: 'Personal Phone', key: 'personal_phone', width: 20 }, // Column H (8)
      { header: 'Place of Registration', key: 'place_of_registration', width: 25 }, // Column I (9)
      { header: 'Company Address', key: 'company_address', width: 40 }, // Column J (10)
      { header: 'Company*', key: 'company_id', width: 30 },           // Column K (11)
      { header: 'Designation', key: 'designation', width: 25 },       // Column L (12)
      { header: 'Date of Joining*', key: 'date_of_joining', width: 20 }, // Column M (13)
      { header: 'End Date', key: 'end_date', width: 20 },             // Column N (14)
      { header: 'Probation Period', key: 'probation_period', width: 20 }, // Column O (15)
      { header: 'Notice Period', key: 'notice_period', width: 20 },   // Column P (16)
      { header: 'Working Days', key: 'working_days', width: 20 },     // Column Q (17)
      { header: 'Contract Duration', key: 'contract_duration', width: 20 }, // Column R (18)
      { header: 'Contract Type', key: 'contract_type', width: 20 },   // Column S (19)
      { header: 'Employment Type', key: 'employment_type', width: 35 }, // Column T (20)
      { header: 'Visa Sponsor Type', key: 'visa_sponsor_type', width: 30 }, // Column U (21)
      { header: 'Current Location', key: 'current_location', width: 20 }, // Column V (22) - RIGHT AFTER VISA SPONSOR
      { header: 'Employee Location', key: 'employee_location', width: 20 }, // Column W (23) - RIGHT AFTER CURRENT LOCATION
      { header: 'Expected Arrival', key: 'expected_arrival', width: 20 }, // Column X (24)
      { header: 'Work Location', key: 'work_location', width: 20 },   // Column Y (25)
      { header: 'Invoice Date', key: 'invoice_date', width: 25 },     // Column Z (26)
      { header: 'Payment Due Notification', key: 'payment_due_notification', width: 30 }, // Column Z (26)
      { header: 'Salary Payment Date', key: 'salary_payment_date', width: 25 }, // Column AA (27)
      // { header: 'Invoice Format', key: 'invoice_format', width: 20 }, // Column AB (28) - COMMENTED OUT
      { header: 'Total Fixed', key: 'total_fixed', width: 20 },       // Column AB (28) - shifted from AC (29)
      { header: 'Basic Salary', key: 'basic_salary', width: 20 },     // Column AC (29) - shifted from AD (30)
      { header: 'Housing/HRA Allowance', key: 'housing_allowance', width: 25 }, // Column AD (30) - shifted from AE (31)
      { header: 'Transportation/Car Allowance', key: 'transportation_allowance', width: 30 }, // Column AE (31) - shifted from AF (32)
      { header: 'Food Allowance', key: 'food_allowance', width: 20 }, // Column AF (32) - shifted from AG (33)
      { header: 'Petrol Allowance', key: 'petrol_allowance', width: 20 }, // Column AG (33) - shifted from AH (34)
      { header: 'Other Allowance', key: 'other_allowance', width: 20 }, // Column AH (34) - shifted from AI (35)
      { header: 'Salary Remarks', key: 'salary_remarks', width: 40 }, // Column AI (35) - shifted from AJ (36)
      { header: 'Dependent 1 Name', key: 'dependent_1_name', width: 25 }, // Column AJ (36) - shifted from AK (37)
      { header: 'Dependent 1 Relation', key: 'dependent_1_relation', width: 20 }, // Column AK (37) - shifted from AL (38)
      { header: 'Dependent 2 Name', key: 'dependent_2_name', width: 25 }, // Column AL (38) - shifted from AM (39)
      { header: 'Dependent 2 Relation', key: 'dependent_2_relation', width: 20 }, // Column AM (39) - shifted from AN (40)
      { header: 'Dependent 3 Name', key: 'dependent_3_name', width: 25 }, // Column AN (40) - shifted from AO (41)
      { header: 'Dependent 3 Relation', key: 'dependent_3_relation', width: 20 } // Column AO (41) - shifted from AP (42)
    ];

    // Add title row first
    const title = `Employee Bulk Upload Template - ${moment().format('MMMM YYYY')}`;
    sheet.addRow([title]);
    sheet.getRow(1).font = { bold: true, size: 16 };
    sheet.getRow(1).alignment = { horizontal: 'center' };
    sheet.mergeCells(1, 1, 1, columns.length);

    // Add header row
    const headerValues = columns.map(col => col.header);
    const headerRow = sheet.addRow(headerValues);

    // Set column widths
    columns.forEach((col, index) => {
      sheet.getColumn(index + 1).width = col.width;
    });

    // Style header row
    headerRow.height = 30;
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Get Company data dynamically
    let companies = ['Default Company'];
    try {
      const companiesData = await Companies.find({ is_deleted: false, status: { $in: ['active', 'new'] } });
      console.log('found', companiesData.length, 'companies');
      if (companiesData?.length > 0) {
        companies = companiesData.map(company => company.name || company.company_name);
      }
    } catch (error) {
      console.warn('Could not fetch companies, using default:', error.message);
    }

    // Get Countries data from multiple API sources with fallbacks
    let countries = [
      'Afghanistan',
      'Albania',
      'Algeria',
      'Argentina',
      'Australia',
      'Austria',
      'Bahrain',
      'Bangladesh',
      'Belgium',
      'Brazil',
      'Canada',
      'China',
      'Denmark',
      'Egypt',
      'France',
      'Germany',
      'India',
      'Indonesia',
      'Iran',
      'Iraq',
      'Ireland',
      'Italy',
      'Japan',
      'Jordan',
      'Kuwait',
      'Lebanon',
      'Malaysia',
      'Netherlands',
      'Nigeria',
      'Norway',
      'Oman',
      'Pakistan',
      'Philippines',
      'Qatar',
      'Russia',
      'Saudi Arabia',
      'Singapore',
      'South Africa',
      'South Korea',
      'Spain',
      'Sri Lanka',
      'Sweden',
      'Switzerland',
      'Thailand',
      'Turkey',
      'Ukraine',
      'United Arab Emirates',
      'United Kingdom',
      'United States',
      'Vietnam'
    ]; // Comprehensive fallback list

    try {
      const axios = require('axios');
      let apiResponse = null;

      // Try multiple API endpoints
      const apiEndpoints = [
        'https://restcountries.com/v3.1/all?fields=name',
        'https://restcountries.com/v2/all?fields=name',
        'https://api.worldbank.org/v2/country?format=json&per_page=300'
      ];

      for (const endpoint of apiEndpoints) {
        try {
          console.log(`Trying API endpoint: ${endpoint}`);
          apiResponse = await axios.get(endpoint, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; ExcelTemplateGenerator/1.0)',
              Accept: 'application/json'
            }
          });

          if (apiResponse.data && Array.isArray(apiResponse.data)) {
            // Handle different API response formats
            if (endpoint.includes('restcountries.com/v3.1')) {
              countries = apiResponse.data
                .map(country => country.name?.common)
                .filter(name => name && typeof name === 'string')
                .sort();
            } else if (endpoint.includes('restcountries.com/v2')) {
              countries = apiResponse.data
                .map(country => country.name)
                .filter(name => name && typeof name === 'string')
                .sort();
            } else if (endpoint.includes('worldbank.org')) {
              // World Bank API returns different format
              if (apiResponse.data[1]) {
                countries = apiResponse.data[1]
                  .map(country => country.name)
                  .filter(name => name && typeof name === 'string')
                  .sort();
              }
            }

            if (countries.length > 50) {
              console.log(`Successfully fetched ${countries.length} countries from API`);
              break; // Success, exit the loop
            }
          }
        } catch (apiError) {
          console.warn(`API endpoint ${endpoint} failed:`, apiError.message);
          continue; // Try next endpoint
        }
      }

      if (countries.length <= 50) {
        throw new Error('All API endpoints failed or returned insufficient data');
      }
    } catch (error) {
      console.warn('Could not fetch countries from any API, using comprehensive fallback list:', error.message);
      // Use the comprehensive fallback list defined above
    }

    // Helper function for dropdown validation
    const addDropdownValidation = (range, options, title, allowBlank = true) => {
      try {
        let formulae;
        if (Array.isArray(options)) {
          // Traditional array approach
          formulae = [`"${options.join(',')}"`];
        } else {
          // Sheet reference approach
          formulae = [options];
        }

        sheet.dataValidations.add(range, {
          type: 'list',
          allowBlank: allowBlank,
          formulae: formulae,
          showErrorMessage: true,
          errorTitle: `Invalid ${title}`,
          error: `Please select a valid ${title.toLowerCase()} from the dropdown`,
          showDropDown: true
        });
      } catch (error) {
        console.warn(`Could not add dropdown validation for ${title}:`, error.message);
      }
    };

    // Email validation helper function
    const addEmailValidation = (range, fieldName) => {
      try {
        sheet.dataValidations.add(range, {
          type: 'textLength',
          operator: 'greaterThan',
          formulae: [5],
          allowBlank: true,
          showErrorMessage: true,
          errorTitle: 'Invalid Email',
          error: `Please enter a valid ${fieldName.toLowerCase()}.`
        });
      } catch (error) {
        console.warn(`Could not add email validation for ${fieldName}:`, error.message);
      }
    };

    // Create separate sheets for dropdown data

    // Companies sheet
    const companiesSheet = workbook.addWorksheet('Companies', { state: 'hidden' });
    companies.forEach((company, index) => {
      companiesSheet.getCell(`A${index + 1}`).value = company;
    });

    // Countries sheet - for nationality dropdown
    const countriesSheet = workbook.addWorksheet('Countries', { state: 'hidden' });
    countries.forEach((country, index) => {
      countriesSheet.getCell(`A${index + 1}`).value = country;
    });

    console.log(`Created Countries sheet with ${countries.length} countries`);

    // Monthly dates sheet - for Invoice Date, Payment Due Notification, and Salary Payment Date
    const monthlyDatesSheet = workbook.addWorksheet('MonthlyDates', { state: 'hidden' });
    const monthlyDates = [
      '1st of each month',
      '2nd of each month',
      '3rd of each month',
      '4th of each month',
      '5th of each month',
      '6th of each month',
      '7th of each month',
      '8th of each month',
      '9th of each month',
      '10th of each month',
      '11th of each month',
      '12th of each month',
      '13th of each month',
      '14th of each month',
      '15th of each month',
      '16th of each month',
      '17th of each month',
      '18th of each month',
      '19th of each month',
      '20th of each month',
      '21st of each month',
      '22nd of each month',
      '23rd of each month',
      '24th of each month',
      '25th of each month',
      '26th of each month',
      '27th of each month',
      '28th of each month',
      '29th of each month',
      '30th of each month',
      '31st of each month'
    ];

    monthlyDates.forEach((date, index) => {
      monthlyDatesSheet.getCell(`A${index + 1}`).value = date;
    });

    console.log(`Created MonthlyDates sheet with ${monthlyDates.length} date options`);

    // Column F (6) - Nationality
    addDropdownValidation('F3:F1002', `Countries!$A$1:$A$${countries.length}`, 'Nationality', true);

    // Column K (11) - Company*
    addDropdownValidation('K3:K1002', `Companies!$A$1:$A$${companies.length}`, 'Company', false);

    // Column O (15) - Probation Period
    addDropdownValidation(
      'O3:O1002',
      ['0 Months', '1 Month', '2 Months', '3 Months', '4 Months', '5 Months', '6 Months'],
      'Probation Period',
      false
    );

    // Column P (16) - Notice Period
    addDropdownValidation(
      'P3:P1002',
      ['1 Month', '2 Months', '3 Months'],
      'Notice Period',
      false
    );

    // Column Z (26) - Invoice Date
    addDropdownValidation('Z3:Z1002', `MonthlyDates!$A$1:$A${monthlyDates.length}`, 'Invoice Date', false);

    // Column AA (27) - Payment Due Notification
    addDropdownValidation('AA3:AA1002', `MonthlyDates!$A$1:$A${monthlyDates.length}`, 'Payment Due Notification', false);

    // Column AB (28) - Salary Payment Date
    addDropdownValidation('AB3:AB1002', `MonthlyDates!$A$1:$A${monthlyDates.length}`, 'Salary Payment Date', false);

    // Column Q (17) - Working Days
    addDropdownValidation('Q3:Q1002', ['5 Working Days', '6 Working Days'], 'Working Days', false);

    // Column S (19) - Contract Type
    addDropdownValidation('S3:S1002', ['Full Time', 'Temporary'], 'Contract Type', false);

    // Column T (20) - Employment Type
    addDropdownValidation(
      'T3:T1002',
      ['Mission Visa (3 Months Single Entry)', 'Work Permit (for UAE Resident visa holders)', 'Employment Visa (2-Year)'],
      'Employment Type',
      false
    );

    // Column U (21) - Visa Sponsor Type
    addDropdownValidation(
      'U3:U1002',
      ['Dynamic Employment Services', 'Executive Employment Services'],
      'Visa Sponsor Type',
      false
    );

    // Column V (22) - Current Location (right after Visa Sponsor Type)
    addDropdownValidation(
      'V3:V1002',
      ['Dubai', 'Abu Dhabi'],
      'Current Location',
      true
    );

    // Column W (23) - Employee Location (right after Current Location)
    addDropdownValidation(
      'W3:W1002',
      ['Inside UAE', 'Outside UAE'],
      'Employee Location',
      true
    );

    // Apply email validation
    // Column D (4) - Email*
    addEmailValidation('D3:D1002', 'Email');

    // Format date columns to display dates properly in DD-MM-YYYY format
    // Remove problematic date validations and just format the columns
    // Add date validations for Date of Birth, Date of Joining, and End Date
    const dateValidationStart = new Date(1900, 0, 1); // Starting validation date

    // Date of Birth validation
    sheet.dataValidations.add('G3:G1002', {
      type: 'date',
      operator: 'greaterThanOrEqual',
      formulae: [dateValidationStart],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: 'Invalid Date of Birth',
      error: 'Please enter a valid date of birth (DD-MM-YYYY format)',
      showInputMessage: true,
      inputTitle: 'Date Format',
      inputMessage: 'Enter date in DD-MM-YYYY format or use the date picker'
    });

    // Date of Joining validation
    sheet.dataValidations.add('M3:M1002', {
      type: 'date',
      operator: 'greaterThanOrEqual',
      formulae: [dateValidationStart],
      allowBlank: false,
      showErrorMessage: true,
      errorTitle: 'Invalid Date of Joining',
      error: 'Please enter a valid date of joining (DD-MM-YYYY format)',
      showInputMessage: true,
      inputTitle: 'Date Format',
      inputMessage: 'Enter date in DD-MM-YYYY format or use the date picker'
    });

    // End Date validation
    sheet.dataValidations.add('N3:N1002', {
      type: 'date',
      operator: 'greaterThanOrEqual',
      formulae: [dateValidationStart],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: 'Invalid End Date',
      error: 'Please enter a valid end date (DD-MM-YYYY format)',
      showInputMessage: true,
      inputTitle: 'Date Format',
      inputMessage: 'Enter date in DD-MM-YYYY format or use the date picker'
    });

    // Format date columns to display dates properly in DD-MM-YYYY format
    const dateColumns = [7, 13, 14]; // Column G (Date of Birth), Column M (Date of Joining), Column N (End Date)
    for (let row = 3; row <= 1002; row++) {
      dateColumns.forEach(colIndex => {
        sheet.getCell(row, colIndex).numFmt = 'dd-mm-yyyy';
      });
    }

    // Format phone columns as text
    const phoneColumns = [5, 8]; // Column E (Phone), Column H (Personal Phone)
    for (let row = 3; row <= 1002; row++) {
      phoneColumns.forEach(colIndex => {
        sheet.getCell(row, colIndex).numFmt = '@';
      });
    }

    // Add instructions section
    const instructionRow = 25;
    sheet.getCell(`A${instructionRow}`).value = 'INSTRUCTIONS:';
    sheet.getCell(`A${instructionRow}`).font = { bold: true, size: 12, color: { argb: 'FF0000' } };

    const instructions = [
      '1. Required fields (marked with *): First Name, Last Name, Email, Company, Date of Joining',
      '2. Date fields: Use DD-MM-YYYY format (e.g., 25-07-2025)',
      '3. Email: Must be valid (e.g., user@domain.com)',
      '4. Phone numbers: Enter as text to preserve formatting',
      '5. Dropdown fields: Select only from provided options',
      '6. Optional fields: Use "NA", "N/A", or leave empty',
      '7. Maximum 1000 rows of data can be uploaded',
      '8. Do not modify column headers or their order',
      '9. IMPORTANT: Employee Location should be set based on Visa Sponsor Type:',
      '   - Dynamic Employment Services → Dubai',
      '   - Executive Employment Services → Abu Dhabi'
    ];

    instructions.forEach((instruction, index) => {
      const currentRow = instructionRow + index + 1;
      sheet.getCell(`A${currentRow}`).value = instruction;
      sheet.getCell(`A${currentRow}`).font = { italic: true, size: 10 };
    });

    // Convert workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Error generating bulk upload template:', error);
    throw new Error(`Failed to generate Excel template: ${error.message}`);
  }
};


const bulkUploadOnboardings = async (req) => {
  try {
    // Log req.files for debugging
    console.log('Start of req files:', req.files);
    console.log('completed step 1--->');
    const filename = req.files.file.tempFilePath;
    console.log('Reading file:', filename);
    console.log('completed step 2--->');
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(filename);
    console.log('completed step 3--->');

    const moment = require('moment');
    const uploaderUserId = req.userId;
    const uploaderUserName = req.userName;
    const uploaderUserEmail = req.userEmail;
    console.log('completed step 4--->');

    // Sheet/row parsing logic
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('completed step 5--->');
    const headerRow = data[1] || [];
    const headers = headerRow.map(h => (h || '').toString().trim());
    const headerMap = {};
    headers.forEach((h, idx) => {
      if (h) headerMap[h.replace(/\*/g, '').trim().toLowerCase()] = idx;
    });
    console.log('completed step 6------>');

    function getCell(row, name) {
      const idx = headerMap[name.toLowerCase()];
      if (typeof idx !== 'number') return '';
      return (row[idx] || '').toString().trim();
    }

    function parsePayrollDropdown(val) {
      if (!val) return { display: '', value: '' };
      const match = val.match(/^\d{1,2}/);
      return match ? { display: val, value: match[0] } : { display: val, value: '' };
    }

    function cleanValue(value) {
      if (!value) return '';
      const trimmedValue = value.toString().trim().toLowerCase();
      const naValues = ['na', 'n/a', 'not applicable', 'none', '-', '--'];
      return naValues.includes(trimmedValue) ? '' : value.toString().trim();
    }

    function isValidEmail(email) {
      if (!email) return false;
      const trimmedEmail = email.toString().trim().toLowerCase();
      const naValues = ['na', 'n/a', 'not applicable', 'none', '-', '--'];
      if (naValues.includes(trimmedEmail)) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    }

    function parseExcelDate(serial) {
      if (!serial || isNaN(serial)) return '';
      const excelEpoch = moment('1900-01-01');
      return moment(excelEpoch).add(serial - 2, 'days').format('DD-MM-YYYY');
    }

    // Result structure
    let result = {
      message: null,
      error: null,
      duplicates: [],
      added: 0,
      errors: [],
      totalProcessed: 0,
      companiesReused: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        duplicates: 0,
        skipped: 0
      }
    };

    const seenEmails = new Set();
    let skippedRowsCount = 0;
    console.log('completed step 7--->');

    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      // Stop at instructions row
      if (row && row[0] && row[0].toString().trim().toLowerCase() === 'instructions:') {
        console.log('completed step 6------>'); // Log for instructions row
        break;
      }

      // Enhanced empty row detection - check for essential fields
      const email = cleanValue(getCell(row, 'Email'));
      const companyName = cleanValue(getCell(row, 'Company'));
      const firstName = cleanValue(getCell(row, 'First Name'));
      const lastName = cleanValue(getCell(row, 'Last Name'));

      // Skip rows that don't have essential fields
      const hasEssentialFields = email && companyName && firstName && lastName;

      if (!hasEssentialFields) {
        skippedRowsCount++;
        console.log(`Skipping row ${i + 1} with incomplete data: Email="${email}", Company="${companyName}", FirstName="${firstName}", LastName="${lastName}"`);
        continue;
      }

      result.totalProcessed++;
      console.log('completed step 6------>');

      try {
        // Get additional required fields (essential fields already validated above)
        const dateOfJoining = cleanValue(getCell(row, 'Date of Joining'));

        // Validate additional required fields
        if (!dateOfJoining) {
          result.errors.push({ row: i + 1, email, company: companyName, error: 'Missing date of joining' });
          result.summary.failed++;
          continue;
        }

        // Check for duplicate email
        // if (seenEmails.has(email)) {
        //   result.duplicates.push({ row: i + 1, email, company: companyName, reason: 'Duplicate in file' });
        //   continue;
        // }
        // seenEmails.add(email);

        // Find company
        const companyDoc = await Companies.findOne({ $or: [{ name: companyName }, { company_name: companyName }], is_deleted: false });
        console.log('completed step 8--->', companyDoc?._id);
        if (!companyDoc) {
          result.errors.push({ row: i + 1, email, company: companyName, error: `Company not found: ${companyName}` });
          continue;
        }
        result.companiesReused.push({ row: i + 1, company_name: companyName, company_id: companyDoc._id, action: 'Used existing company' });
        console.log('completed step 9--->', companyDoc._id);

        // Check for existing user
        // const existingUser = await Users.findOne({ email: email, is_deleted: { $ne: true } });
        // if (existingUser) {
        //   result.duplicates.push({ row: i + 1, email, company: companyName, reason: 'User with this email already exists' });
        //   continue;
        // }

        // Validate Employee Location based on Visa Sponsor Type
        const employmentType = cleanValue(getCell(row, 'Employment Type'));
        const visaSponsorType = cleanValue(getCell(row, 'Visa Sponsor Type'));
        let employeeLocation = cleanValue(getCell(row, 'Current Location'));
        let currentLocation = cleanValue(getCell(row, 'Employee Location'));
        if (visaSponsorType === 'Dynamic Employment Services' && employeeLocation !== 'Dubai') {
          result.errors.push({ row: i + 1, email, company: companyName, error: 'Employee Location must be Dubai for Dynamic Employment Services' });
          continue;
        } else if (visaSponsorType === 'Executive Employment Services' && employeeLocation !== 'Abu Dhabi') {
          result.errors.push({ row: i + 1, email, company: companyName, error: 'Employee Location must be Abu Dhabi for Executive Employment Services' });
          continue;
        }

        // Validate salary fields
        const salaryFields = [
          parseFloat(cleanValue(getCell(row, 'Basic Salary'))) || 0,
          parseFloat(cleanValue(getCell(row, 'Housing/HRA Allowance'))) || 0,
          parseFloat(cleanValue(getCell(row, 'Transportation/Car Allowance'))) || 0,
          parseFloat(cleanValue(getCell(row, 'Food Allowance'))) || 0,
          parseFloat(cleanValue(getCell(row, 'Petrol Allowance'))) || 0,
          parseFloat(cleanValue(getCell(row, 'Other Allowance'))) || 0
        ];
        const totalFixed = parseFloat(cleanValue(getCell(row, 'Total Fixed'))) || 0;
        const sumOfAllowances = salaryFields.reduce((sum, val) => sum + val, 0);
        if (totalFixed && Math.abs(totalFixed - sumOfAllowances) > 0.01) {
          result.errors.push({ row: i + 1, email, company: companyName, error: 'Total Fixed does not match sum of allowances' });
          continue;
        }

        // Construct employment object
        const employment = {
          designation: cleanValue(getCell(row, 'Designation')),
          date_of_joining: parseExcelDate(getCell(row, 'Date of Joining')),
          end_date: parseExcelDate(getCell(row, 'End Date')),
          probation_period: cleanValue(getCell(row, 'Probation Period')),
          notice_period: cleanValue(getCell(row, 'Notice Period')),
          working_days: cleanValue(getCell(row, 'Working Days')),
          working_hours: '9:00am to 6:00pm day (Including 1-hour lunch break) / 9 Hours per day (Including 1-hour lunch break)',
          contract_duration: cleanValue(getCell(row, 'Contract Duration')),
          contract_type: cleanValue(getCell(row, 'Contract Type')),
          employment_type: employmentType,
          visa_sponsor_type: visaSponsorType,
          expected_arrival: parseExcelDate(getCell(row, 'Expected Arrival')),
          work_location: cleanValue(getCell(row, 'Work Location'))
        };

        // Construct payroll details
        const payroll_details = {
          invoice_date: parsePayrollDropdown(getCell(row, 'Invoice Date')),
          payment_due_notification: parsePayrollDropdown(getCell(row, 'Payment Due Notification')),
          salary_payment_date: parsePayrollDropdown(getCell(row, 'Salary Payment Date')),
          follow_different_payroll_schedule: false
        };

        // Construct salary object
        const salary = {
          total_fixed: totalFixed,
          remarks: cleanValue(getCell(row, 'Salary Remarks')),
          basic_salary: cleanValue(getCell(row, 'Basic Salary')),
          'housing/hra_allowance': cleanValue(getCell(row, 'Housing/HRA Allowance')),
          'transportation/car_allowance': cleanValue(getCell(row, 'Transportation/Car Allowance')),
          food_allowance: cleanValue(getCell(row, 'Food Allowance')),
          petrol_allowance: cleanValue(getCell(row, 'Petrol Allowance')),
          other_allowance: cleanValue(getCell(row, 'Other Allowance'))
        };

        // Construct dependent details
        const dependent_details = [];
        for (let d = 1; d <= 3; d++) {
          const name = cleanValue(getCell(row, `Dependent ${d} Name`));
          const relation = cleanValue(getCell(row, `Dependent ${d} Relation`));
          if (name && relation) dependent_details.push({ dependent_name: name, relation });
        }

        // Construct personal details
        const personal = {
          phone: cleanValue(getCell(row, 'Personal Phone')),
          nationality: cleanValue(getCell(row, 'Nationality')),
          dob: parseExcelDate(getCell(row, 'Date of Birth'))
        };

        // Construct user body
        const usersBody = {
          personal,
          company_id: companyDoc._id,
          first_name: firstName,
          middle_name: cleanValue(getCell(row, 'Middle Name')),
          last_name: lastName,
          email: email,
          phone: cleanValue(getCell(row, 'Phone')),
          image_url: '',
          dob: parseExcelDate(getCell(row, 'Date of Birth')),
          place_of_registration: cleanValue(getCell(row, 'Place of Registration')),
          role_ID: '640f064bbe01c2e00bd95082',
          company_address: cleanValue(getCell(row, 'Company Address')),
          user_location: employeeLocation || 'Outside UAE',
          current_location:currentLocation,
          // user_location: employment.visa_sponsor_type == 'Dynamic Employment Services' ? 'Inside UAE' : 'Outside UAE',
          employment,
          payroll_details,
          salary,
          dependent_details,
          // insurance_agent: null,
          // assigned_insurance_agent: { id: '', full_name: '', email: '' },
          user_status: 'onboarding',
          created_by: uploaderUserId
        };
        console.log('completed step 10--->', companyDoc._id);

        // Generate reference number
        const companyCode = companyDoc.company_code || companyDoc.company_name || companyDoc.name;
        const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let uniqueString = `PEO-${escapeRegex(companyCode)}`;
        const count = await Users.countDocuments({ reference_number: new RegExp(`^${uniqueString}`) });
        uniqueString += `-${String(count + 1).padStart(4, '0')}`;
        usersBody.reference_number = uniqueString;
        usersBody.password = (usersBody.first_name || '').slice(0, 4).toUpperCase() + personal.dob;

        // Create user
        const userDoc = await new Users(usersBody).save();

        // Onboarding logic (unchanged)
        let employment_type = employment.employment_type;
        let processArray = [];
        if (employment_type == 'Employment Visa (2-Year)') {
          processArray = await Processes.find({ process_name: 'onboarding process' });
        } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
          processArray = await Processes.find({ process_name: 'mission visa onboarding process' });
        } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
          processArray = await Processes.find({ process_name: 'work permit onboarding process' });
        }
        let onboardingsBody = {
          status: 'Employee Details',
          stage_type: 'onboarding',
          attachments: [],
          process_type: 'onboarding process',
          company_id: companyDoc._id,
          // user_location: usersBody.user_location,
          user_location: usersBody.current_location,
          user_id: userDoc._id,
          processes: []
        };
        let docCloneIds = [];
        let conditionType;
        let document_template;
        let processNameFromProcessArray = processArray[0]?.process_name;
        for (const process of processArray[0]?.stages || []) {
          const documentActions = [];
          for (const action of process.actions) {
            if (action.action_type === 'document') {
              if (action.condition) {
                conditionType = visaSponsorType == 'Dynamic Employment Services' ? 'DES' : 'EES';
                let condition = {
                  'condition.type': conditionType,
                  'condition.document_name': action.condition.document_name,
                  'condition.employment_type': employment_type
                };
                if (conditionType === 'EES' && process.stage_name == 'Create Employment contract')
                  condition['condition.document_name'] = 'employment_contract_ees';
                if (conditionType === 'EES' && process.stage_name == 'Create Work Order')
                  condition['condition.document_name'] = 'work_order_ees';
                if (conditionType === 'EES' && process.stage_name == 'Create Work Order' && processNameFromProcessArray == 'mission visa onboarding process')
                  condition['condition.document_name'] = 'work_order_mission_visa_ees';
                if (action.condition.document_name !== 'work_order') delete condition['condition.employment_type'];
                document_template = await require('./document_template.service').getDocTemplatesOnCondition(condition);
              } else {
                document_template = await require('./document_template.service').getDocTemplatesOnID(action.template_id);
              }
              const template = document_template;
              template.auto_replace_keys.forEach(replaceKeys => { replaceKeys.fk_id = ''; });
              let templateBody = {
                auto_replace_keys: template.auto_replace_keys,
                user_input_keys: template.user_input_keys,
                name: template.name,
                content: template.content,
                module: template.module
              };
              if (action.condition) {
                templateBody.condition = {
                  type: conditionType,
                  document_name: action.condition.document_name,
                  employment_type: employment_type
                };
              }
              const create_document_template_clone = await require('./document_template_clone.service').createDocumentTemplateClone(templateBody);
              action.template_id = create_document_template_clone._id;
              docCloneIds.push({ _id: create_document_template_clone._id });
              documentActions.push(true);
            } else {
              onboardingsBody.processes = processArray[0].stages;
              documentActions.push(true);
            }
          }
        }
        const reconstructedUserBody = {
          company_name: companyDoc.company_name,
          company_email: companyDoc.email,
          first_name: userDoc.first_name,
          last_name: userDoc.last_name,
          employment_type: userDoc.employment.employment_type,
          email: userDoc.email
        };
        const onboardingDoc = await module.exports.createOnboardings(onboardingsBody, reconstructedUserBody, null);
        await require('../models').DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: onboardingDoc._id } });
        await module.exports.notifyUser(onboardingDoc);

        // Email to client
        let searchTerm = {};
        if (['Employment Visa (2-Year)', 'Work Permit (for UAE Resident visa holders)', 'employment_visa'].includes(userDoc.employment.employment_type)) {
          searchTerm.templateName = 'Employee Details (Email to Client)';
        } else if (userDoc.employment.employment_type == 'Mission Visa (3 Months Single Entry)') {
          searchTerm.templateName = 'Employee Details (Mission Visa Client Email)';
        }
        const detailsReceeivedTemplate = await require('./email_template.service').getEmailTemplateByName(searchTerm);
        if (detailsReceeivedTemplate) {
          const templateWithReplacedKeys = await require('./email_template.service').getEmailTemplateOnIDWithoutContent(
            detailsReceeivedTemplate._id,
            onboardingDoc._id,
            null,
            null,
            null
          );
          if (templateWithReplacedKeys) {
            templateWithReplacedKeys.to = [companyDoc.email];
            await require('../middlewares/email').sendRawEmail(
              templateWithReplacedKeys.to,
              templateWithReplacedKeys.subject,
              templateWithReplacedKeys.content,
              templateWithReplacedKeys.cc,
              []
            );
          }
        }

        // Insurance inquiry
        try {
          let insuranceInquiryBody = {
            source: 'PEO Services',
            user_id: userDoc._id,
            company_id: companyDoc._id,
            request_mail_id: uploaderUserEmail || 'sahiba@nathanhr.com',
            agent_id: '667910bce76ebe86ddb2cb89',
            parent_company_id: visaSponsorType === 'Dynamic Employment Services' ? (require('../config').parentCompanyIds.dynamicEmploymentServices) : (require('../config').parentCompanyIds.executiveEmploymentServices)
          };
        } catch (err) {}

        result.added++;
        result.summary.successful++;
      } catch (err) {
        result.errors.push({ row: i + 1, email: getCell(row, 'Email'), company: getCell(row, 'Company'), error: err.message });
        result.summary.failed++;
      }
    }

    // Set summary counts
    result.summary.total = result.totalProcessed;
    result.summary.skipped = skippedRowsCount;
    result.summary.duplicates = result.duplicates.length;

    // Compose improved message
    if (result.added > 0) {
      if (result.summary.skipped > 0) {
        result.message = `✅ Successfully added ${result.added} onboardings! (${result.summary.skipped} incomplete rows were skipped)`;
      } else {
        result.message = `✅ Successfully added ${result.added} onboardings!`;
      }
    } else {
      result.message = 'No new onboardings were added.';
    }
    if (result.duplicates.length > 0) {
      result.message += ` ${result.duplicates.length} duplicate(s) found.`;
    }
    if (result.companiesReused.length > 0) {
      result.message += ` ${result.companiesReused.length} existing company(ies) reused.`;
    }
    if (result.errors.length > 0) {
      result.message += ` ${result.errors.length} error(s) occurred.`;
    }

    return result;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  getDiffPipelineList,
  getOnboardingPipeline,
  getOnboardingStatusCount,
  createOnboardings,
  updateOnboardingsOnId,
  updateUpdatedBy,
  updateCreatedBy,
  listAllOnboardings,
  getOnboardings,
  onboardingsById,
  deleteOnboardings,
  onboardingsOnUserID,
  onboardingsOnStageID,
  onboardingsOnStatus,
  filterOnDatesStatusAndStageTypes,
  listOfUsersAndCompaniesWithStatus,
  extendedListOfUsersAndCompanies,
  onboardingProcessForward,
  onboardingProcessBackward,
  listOfOnboardingStatus,
  getApplicationDistribution,
  notifyUser,
  getProcessDetailForInvoice,
  getInvoiceDocuments,
  getOnboardingsOnCompanyId,
  notifyAdmin,
  exportBulkUploadTemplate,
  bulkUploadOnboardings
};
