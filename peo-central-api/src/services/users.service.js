const {
  Users,
  Token,
  Companies,
  Otp,
  Poc,
  Role,
  Onboardings,
  Offboardings,
  Renewals,
  VisaProcess,
  emailTemplate,
  Configurations
} = require('../models');
const { Documents, DocumentTypes } = require('../models');
const { ObjectId } = require('mongodb');
const queryService = require('./query.service');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const pagination = require('../middlewares/paginate');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const moment = require('moment-timezone');
const { diff } = require('deep-object-diff');
const CENTRAL_URL = process.env.CENTRAL_URL;
const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');
const { findByCredentials, findByEmail } = require('../services/user_model.service');
const configuration = require('../models/configuration.model');
const AWS = require('aws-sdk');
const MailComposer = require('nodemailer/lib/mail-composer');
const { EmailLog } = require('../models/index');
const { uploadFilesToS3 } = require('./aws.service');
const emailService = require('./email.service');
const emailTemplateService = require('./email_template.service');
const { sendRawEmail } = require('../middlewares/email');
const otpService = require('./otp.service');
const fs = require('fs');
const excelJs = require('exceljs');
const { getInsuranceAgents } = require('../helpers/insurance_agents.helper');
const config = require('../config/config');
const ses = new AWS.SES({
  // accessKeyId: process.env.SECRET_ID_AWS,
  // secretAccessKey: process.env.SECRET_KEY_AWS,
  region: 'eu-central-1'
});

// Function to escape special characters in a string for use in a regex
const escapeRegex = string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
//Basic creation of an user
const createUser = async userBody => {
  let newUser = new Users(userBody);
  return await newUser.save();
};
function formatDate(val) {
  return val ? moment(val).format('DD-MMM-YYYY') : '';
}

const fetchEmployeesByCompanyIdAndEmployment = async (companyId, reqQuery) => {
  try {
    const filter = {
      company_id: ObjectId(companyId),
      is_deleted: false,
      'employment.visa_sponsor_type': reqQuery.sponsorType
        ? { $regex: new RegExp(reqQuery.sponsorType, 'i') }
        : { $exists: true }
    };

    // Define pagination options
    const options = {
      page: reqQuery.page ? parseInt(reqQuery.page, 10) : 1,
      limit: reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10,
      sortBy: reqQuery.sortBy || 'createdAt:-1'
    };

    // Check if there's a search keyword in reqQuery
    if (reqQuery.search && reqQuery.search.length > 0) {
      const searchRegex = new RegExp(reqQuery.search, 'i');
      filter.$or = [{ first_name: searchRegex }, { last_name: searchRegex }, { email: searchRegex }];
    }

    // Log the filter and options for debugging
    console.log('Filter:', filter);
    console.log('Options:', options);
    console.log('Sponsor Type:', reqQuery.sponsorType);

    const users = await Users.paginate(filter, options);

    users.results = users.results.map(user => ({
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name || '',
      email: user.email,
      _id: user._id,
      employment: user.employment,
      salary: user.salary
    }));
    return users;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error; // Throw the error for further handling (like returning 500 in controller)
  }
};

/**
 * This function returns all users with all other roles except employees
 * Its implementation facilitates the mentions functionality on visaProcess comments
 */
const getNonEmployees = async reqQuery => {
  const searchRegex = new RegExp(reqQuery.search, 'i');
  const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
  const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 50;
  const skip = (page - 1) * limit;
  // console.log('type of skip', typeof skip, skip);
  // console.log('type of page', typeof page, page);
  const pipeline = [
    {
      $lookup: {
        from: 'roles',
        localField: 'role_ID',
        foreignField: '_id',
        as: 'roleDetails'
      }
    },
    {
      $unwind: '$roleDetails'
    },
    {
      $match: {
        is_deleted: false,
        'roleDetails.roleName': {
          $ne: 'Employee'
        },
        $or: [
          { first_name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { last_name: { $regex: searchRegex } }
        ]
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ];

  const nonEmployees = await Users.aggregate(pipeline);

  console.log(nonEmployees.length);
  if (nonEmployees.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find non employees');
  }
  return nonEmployees;
};

//Get all the users
const getAllUsers = async (reqQuery, reqBody) => {
  if (reqQuery.comment) {
    return getPros(reqQuery);
  }
  if (reqQuery.role) {
    return fetchSupportHrEscalationRoles(reqQuery.role);
  } else {
    const pages = reqQuery.page ? parseInt(reqQuery.page) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 50;
    const skip = (pages - 1) * limit; // Note: 'skip' should be used in the options below
    const options = {
      limit,
      skip
    };
    const query = { is_deleted: false };
    if (reqQuery.user_status) {
      const statuses = Array.isArray(reqQuery.user_status) ? reqQuery.user_status : [reqQuery.user_status];

      console.log(statuses, 'these are the passed statuses');

      query.user_status = { $in: statuses };
    }

    let searchRegex;
    if (reqQuery.search) {
      searchRegex = new RegExp(escapeRegex(reqQuery.search), 'i');
      query.$or = [{ first_name: searchRegex }, { last_name: searchRegex }, { email: searchRegex }];
    }
    let users = [];

    console.log('this is the request body', reqBody);

    if (reqBody.visibility && reqBody.visibility !== '') {
      console.log('Visibility provided:', reqBody.visibility);
      const systemRoles = await Role.find({ is_deleted: false });
      if (!systemRoles || systemRoles.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Roles');
      }

      const visibility = reqBody.visibility.toLowerCase();
      switch (visibility) {
        case 'superadmin':
          query.role_ID = systemRoles
            .filter(role => role.role_name.toLowerCase() === 'super admin') // Ensure role_name is correctly referenced
            .map(role => role._id);
          break;

        case 'admin':
          query.role_ID = systemRoles.filter(role => role.role_name.toLowerCase() === 'admin').map(role => role._id);
          break;

        case 'manager':
          query.role_ID = systemRoles.filter(role => role.role_name.toLowerCase() === 'manager').map(role => role._id);
          break;

        default:
          throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid visibility type');
      }
    }

    if (reqQuery.user_status) {
      users = await Users.paginate(query, options);
    } else {
      users = await Users.find(query, null, options).select('-password').lean();
    }
    // Check if any users were found
    if (users.length === 0) {
      // Use .length instead of == [] for array comparison
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find User');
    }

    console.log(users.length);
    return users;
  }
};

const getAllPro = async reqBody => {
  try {
    console.log('this is the request body=======>', reqBody);
    let users;
    reqBody.module && reqBody.module.toLowerCase() == 'leads'
      ? (users = await Users.find({ is_internal_staff: true, is_deleted: false }))
      : (users = await Users.find({ role_ID: '640f1c93be01c2e00bd95084', 'employment.designation': 'PRO' }));

    return users;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error fetching PROs');
  }
};

//Get all Users by Email
const getUserByEmail = async email => {
  const users = await Users.findOne({ email });
  if (users == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find User');
  }
  return users;
};

//Get Users by Id
const getUserById = async (id, project = {}) => {
  // const users = await Users.findById(id, { is_deleted: false }, project);
  const insuranceAgents = await getInsuranceAgents();
  if (!insuranceAgents || !insuranceAgents.data || insuranceAgents.data.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Insurance Agents');
  }
  const pipeline = [
    {
      $match: {
        is_deleted: false,
        _id: ObjectId(id)
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
      $unwind: {
        path: '$companyDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'onboardings',
        localField: '_id',
        foreignField: 'user_id',
        as: 'onboardingDetails'
      }
    },
    {
      $unwind: {
        path: '$onboardingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'onboardingDetails.assigned_pro',
        foreignField: '_id',
        as: 'assignedProDetails'
      }
    },
    {
      $unwind: {
        path: '$assignedProDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'assigned_support_agent',
        foreignField: '_id',
        as: 'assignedSupportAgentDetails'
      }
    },
    {
      $unwind: {
        path: '$assignedSupportAgentDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'onboardingDetails.assigned_insurance_agent',
        foreignField: '_id',
        as: 'assignedInsuranceAgentDetails'
      }
    },
    {
      $unwind: {
        path: '$assignedInsuranceAgentDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'assigned_hr_specialist',
        foreignField: '_id',
        as: 'assignedHrSpecialistDetails'
      }
    },
    {
      $unwind: {
        path: '$assignedHrSpecialistDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'offboardings',
        localField: '_id',
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
        from: 'renewals',
        localField: '_id',
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
        localField: '_id',
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
        from: 'users',
        localField: 'assigned_escalation_manager',
        foreignField: '_id',
        as: 'assignedEscalationManagerDetails'
      }
    },
    {
      $unwind: {
        path: '$assignedEscalationManagerDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'documents',
        let: {
          userId: '$_id',
          onboardingIds: '$onboardingDetails._id',
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
                  // Documents linked through onboardings
                  {
                    $and: [
                      { $eq: ['$module', 'onboardings'] },
                      { $ne: ['$$onboardingIds', null] },
                      { $eq: ['$foreign_id', '$$onboardingIds'] }
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
        'onboardingDetails.assignedPro': {
          name: {
            $concat: [
              { $ifNull: ['$assignedProDetails.first_name', ''] },
              {
                $cond: {
                  if: {
                    $gt: [{ $strLenCP: { $ifNull: ['$assignedProDetails.middle_name', ''] } }, 0]
                  },
                  then: { $concat: [' ', { $ifNull: ['$assignedProDetails.middle_name', ''] }] },
                  else: ' '
                }
              },
              { $ifNull: ['$assignedProDetails.last_name', ''] }
            ]
          },
          _id: '$assignedProDetails._id'
        },
        'onboardingDetails.assigned_support_agent': {
          name: {
            $concat: [
              { $ifNull: ['$assignedSupportAgentDetails.first_name', ''] },
              {
                $cond: {
                  if: {
                    $gt: [{ $strLenCP: { $ifNull: ['$assignedSupportAgentDetails.middle_name', ''] } }, 0]
                  },
                  then: { $concat: [' ', { $ifNull: ['$assignedSupportAgentDetails.middle_name', ''] }] },
                  else: ' '
                }
              },
              { $ifNull: ['$assignedSupportAgentDetails.last_name', ''] }
            ]
          },
          _id: '$assignedSupportAgentDetails._id'
        },
        // 'onboardingDetails.assigned_insurance_agent': {
        //   // name: {
        //   //   $concat: [
        //   //     { $ifNull: ['$assignedInsuranceAgentDetails.first_name', ''] },
        //   //     {
        //   //       $cond: {
        //   //         if: {
        //   //           $gt: [{ $strLenCP: { $ifNull: ['$assignedInsuranceAgentDetails.middle_name', ''] } }, 0],
        //   //         },
        //   //         then: { $concat: [' ', { $ifNull: ['$assignedInsuranceAgentDetails.middle_name', ''] }] },
        //   //         else: ' ',
        //   //       },
        //   //     },
        //   //     { $ifNull: ['$assignedInsuranceAgentDetails.last_name', ''] },
        //   //   ]
        //   // },
        //   // _id: '$assignedInsuranceAgentDetails._id',
        //   name: '$assigned_insurance_agent.full_name',
        //   _id: '$assigned_insurance_agent._id'
        // },
        'onboardingDetails.assigned_hr_specialist': {
          name: {
            $concat: [
              { $ifNull: ['$assignedHrSpecialistDetails.first_name', ''] },
              {
                $cond: {
                  if: {
                    $gt: [{ $strLenCP: { $ifNull: ['$assignedHrSpecialistDetails.middle_name', ''] } }, 0]
                  },
                  then: { $concat: [' ', { $ifNull: ['$assignedHrSpecialistDetails.middle_name', ''] }] },
                  else: ' '
                }
              },
              { $ifNull: ['$assignedHrSpecialistDetails.last_name', ''] }
            ]
          },
          _id: '$assignedHrSpecialistDetails._id'
        },
        'onboardingDetails.assigned_escalation_manager': {
          name: {
            $concat: [
              { $ifNull: ['$assignedEscalationManagerDetails.first_name', ''] },
              {
                $cond: {
                  if: {
                    $gt: [{ $strLenCP: { $ifNull: ['$assignedEscalationManagerDetails.middle_name', ''] } }, 0]
                  },
                  then: { $concat: [' ', { $ifNull: ['$assignedEscalationManagerDetails.middle_name', ''] }] },
                  else: ' '
                }
              },
              { $ifNull: ['$assignedEscalationManagerDetails.last_name', ''] }
            ]
          },
          _id: '$assignedEscalationManagerDetails._id'
        }
      }
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        user_status: 1,
        image_url: 1,
        employment: 1,
        designation: 1,
        last_working_day: {
          $ifNull: ['$offboardingDetails.last_working_day', null]
        },
        company_name: '$companyDetails.company_name',
        personal: 1,
        reference_number: 1,
        reporting: 1,
        date_of_joining: 1,
        assigned_insurance_agent: 1,
        insurance_agent: 1,
        // show salary
        salary: 1,
        uploadedSalaryClearance: 1,
        uploadedSalaryTransfer: 1,
        salary_rotation_required: 1,
        createdAt: 1,
        has_support_agent_role: 1,
        has_hr_specialist_role: 1,
        has_escalation_manager_role: 1,
        has_insurance_agent_role: 1,
        hasMobileLoggedIn: 1,
        firstMobileLoginDate: 1,
        is_internal_staff: 1,
        upfront_costs: '$companyDetails.upfront_costs',
        'onboardingDetails._id': 1,
        'onboardingDetails.assignedPro': 1,
        'onboardingDetails.assigned_support_agent': 1,
        'onboardingDetails.assigned_insurance_agent': 1,
        'onboardingDetails.assigned_hr_specialist': 1,
        'onboardingDetails.assigned_escalation_manager': 1,
        'onboardingDetails.medical_center': {
          $ifNull: ['$onboardingDetails.medical_center', '']
        },
        'onboardingDetails.eid_center': {
          $ifNull: ['$onboardingDetails.eid_center', '']
        },
        'onboardingDetails.tawjeeh_center': {
          $ifNull: ['$onboardingDetails.tawjeeh_center', '']
        },
        'onboardingDetails.eid_center_fingerprint_time': {
          $ifNull: ['$onboardingDetails.eid_center_fingerprint_time', '']
        },
        'onboardingDetails.eid_center_fingerprint_date': {
          $ifNull: ['$onboardingDetails.eid_center_fingerprint_date', ''] // Handle null fingerprint date
        },
        attachedDocuments: { $ifNull: ['$attachedDocuments', []] },
        documentTypes: { $ifNull: ['$documentTypes', []] }
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    }
  ];
  console.log(JSON.stringify(pipeline), 'end');
  const users = await Users.aggregate(pipeline);
  let response = users[0];
  // check if salary transfer document was uploaded
  const salaryTransferType = await DocumentTypes.findOne({ name: 'Salary Transfer Letter', is_deleted: false });
  const salaryClearanceType = await DocumentTypes.findOne({ name: 'Salary Clearance Letter', is_deleted: false });
  if (!salaryTransferType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Transfer Letter Document Type');
  }
  if (!salaryClearanceType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Clearance Letter Document Type');
  }
  const salaryTransferDoc = await Documents.find({
    foreign_id: ObjectId(id),
    type: salaryTransferType._id,
    is_deleted: false
  });

  const salaryClearanceDoc = await Documents.find({
    foreign_id: ObjectId(id),
    type: salaryClearanceType._id,
    is_deleted: false
  });

  if (!response) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find User');
  }

  console.log('found the user', response.first_name);

  if (salaryTransferDoc && salaryTransferDoc.length > 0) {
    // response.uploadedSalaryTransfer = true;
    // Create an array with just the last document
    response.salaryTransferDocument = [salaryTransferDoc[salaryTransferDoc.length - 1]];
  } else {
    // response.uploadedSalaryTransfer = false;
    response.salaryTransferDocument = [];
  }

  if (salaryClearanceDoc && salaryClearanceDoc.length > 0) {
    // response.uploadedSalaryClearance = true;
    // Create an array with just the last document
    response.salaryClearanceDocument = [salaryClearanceDoc[salaryClearanceDoc.length - 1]];
  } else {
    // response.uploadedSalaryClearance = false;
    response.salaryClearanceDocument = [];
  }
  console.log(response.assigned_insurance_agent, 'assigned insurance agent in user service');
  if (response.assigned_insurance_agent) {
    const insuranceAgentId = response.assigned_insurance_agent.toString();

    const agent = insuranceAgents.data.find(agent => agent._id.toString() === insuranceAgentId);

    if (agent) {
      console.log('Processing insurance agent: ', agent.full_name);
      response.onboardingDetails.assigned_insurance_agent = {
        name: agent.full_name,
        _id: agent._id
      };
    } else {
      console.warn('No matching agent found in insuranceAgents for ID:', insuranceAgentId);
    }
  }

  return response;
};

//Users On CompanyID
const usersOnCompanyID = async companyId => {
  let users = await Users.find({ company_id: ObjectId(companyId), is_deleted: false });
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }
  return users;
};

const listAllUsersIdAndSalary = async companyId => {
  const result = await Users.find(
    { is_deleted: false, company_id: ObjectId(companyId) },
    { _id: 1, salary: 1, place_of_registration: 1, first_name: 1, last_name: 1, email: 1, middle_name: 1 }
  );
  if (result.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }
  for (let user of result) {
    user.full_name = user.first_name + (user.middle_name ? ' ' + user.middle_name : '') + ' ' + user.last_name;
  }
  return result;
};

const updateUserOnIdOne = async (userId, updateUserBody, logUserId, logUserName) => {
  try {
    const userResult = await getUserById(userId);
    if (!userResult) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User Not found');
    }

    let updatableFields = {};
    let operatorsToApply = {}; // New object to store pipeline operators like $push

    // Process nested objects
    for (const [key, value] of Object.entries(updateUserBody)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle salary as a complete object, not individual fields
        if (key === 'salary') {
          updatableFields[key] = value;
        } else {
          // For other nested objects, flatten them
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            updatableFields[`${key}.${nestedKey}`] = nestedValue;
          }
        }
      } else {
        updatableFields[key] = value;
      }
    }

    // Handle salary update separately
    let userDoc = await Users.findById(userId);
    let companyDoc = await Companies.findById(userDoc.company_id);

    if (updateUserBody.salary) {
      let updatedFields = diff(userDoc.salary, updateUserBody.salary);
      // Store the $push operation separately
      operatorsToApply['$push'] = {
        salary_change_log: {
          salary: updateUserBody.salary,
          updated_by: logUserId,
          message: `Salary Updated to - ${JSON.stringify(updatedFields)}`,
          status: 'completed',
          updated_user_name: logUserName,
          updated_on: moment.tz('UTC').tz('Asia/Dubai').format()
        }
      };
      // compute previous total salary
      const oldSalary = userDoc.salary.total_fixed;

      const emailParams = {
        first_name: userDoc.first_name,
        last_name: userDoc.last_name,
        email: userDoc.email,
        emp_id: userDoc.emp_id,
        company_name: companyDoc.company_name,
        new_salary: updateUserBody.salary.total_fixed,
        old_salary: oldSalary,
        type: 'salary'
      };
      await emailService.sendsalaryChangeEmail(emailParams);
    }

    // optionally update wage protection system
    if (updateUserBody.nonwps_salary) {
      // console.log(userDoc.nonwps_salary, "WPS")
      const oldSalary = userDoc.nonwps_salary.total_fixed;
      const emailParams = {
        first_name: userDoc.first_name,
        last_name: userDoc.last_name,
        email: userDoc.email,
        emp_id: userDoc.emp_id,
        company_name: companyDoc.company_name,
        new_salary: updateUserBody.nonwps_salary.total_fixed,
        old_salary: oldSalary,
        type: 'nonwps_salary'
      };
      await emailService.sendsalaryChangeEmail(emailParams);
    }
    // optionally update onboarding details
    if (updateUserBody.onboardingDetails) {
      if (updateUserBody.onboardingDetails.assigned_insurance_agent) {
        userDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
        await userDoc.save();
      }
      if (updateUserBody.onboardingDetails.assigned_escalation_manager) {
        userDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
        await userDoc.save();
      }
      const onboardingDoc = await Onboardings.findOne({ _id: userResult.onboardingDetails._id });
      if (!onboardingDoc) console.log(`Could not find onboarding with id ${userResult?.onboardingDetails?._id}`);
      // get support agent email template
      if (updateUserBody.onboardingDetails.assigned_support_agent) {
        const supportAgentEmailTemplt = await emailTemplateService.getEmailTemplateByName({
          templateName: 'Support Agent Notification Email'
        });
        if (supportAgentEmailTemplt) {
          // get replaced template
          const reqBody = {
            userDetails: {
              full_name: userDoc.first_name + ' ' + userDoc.last_name,
              email: userDoc.email,
              company_name: companyDoc.company_name,
              employment_type: userDoc.employment.employment_type,
              visa_sponsor_type: userDoc.employment.visa_sponsor_type,
              phone_number: userDoc.personal.phone
            }
          };
          const replacedTemplt = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
            supportAgentEmailTemplt._id,
            updateUserBody.onboardingDetails.assigned_support_agent,
            reqBody,
            null
          );
          await sendRawEmail(replacedTemplt.to, replacedTemplt.subject, replacedTemplt.content, replacedTemplt.cc, []);
        }
      }
      const offboardingDoc = await Offboardings.findOne({ user_id: userDoc._id });
      const renewalDoc = await Renewals.findOne({ user_id: userDoc._id });
      const visaProcessDoc = await VisaProcess.findOne({ user_id: userDoc._id });

      const documentsToSave = [];

      // Get the keys from onboardingDetails to iterate over them
      const onboardingKeys = Object.keys(updateUserBody.onboardingDetails);

      // Iterate over each key to update relevant documents
      if (onboardingDoc) {
        onboardingKeys.forEach(key => {
          switch (key) {
            case 'medical_center':
              onboardingDoc.medical_center = updateUserBody.onboardingDetails.medical_center;
              onboardingDoc.markModified('medical_center');
              documentsToSave.push(onboardingDoc);
              break;
            case 'eid_center':
              onboardingDoc.eid_center = updateUserBody.onboardingDetails.eid_center;
              onboardingDoc.markModified('eid_center');
              documentsToSave.push(onboardingDoc);
              break;
            case 'tawjeeh_center':
              onboardingDoc.tawjeeh_center = updateUserBody.onboardingDetails.tawjeeh_center;
              onboardingDoc.markModified('tawjeeh_center');
              documentsToSave.push(onboardingDoc);
              break;
            case 'assigned_pro':
              onboardingDoc.assigned_pro = updateUserBody.onboardingDetails.assigned_pro;
              documentsToSave.push(onboardingDoc);
              break;
            case 'assigned_support_agent':
              onboardingDoc.assigned_support_agent = updateUserBody.onboardingDetails.assigned_support_agent;
              documentsToSave.push(onboardingDoc);
              if (renewalDoc) {
                renewalDoc.assigned_support_agent = updateUserBody.onboardingDetails.assigned_support_agent;
                documentsToSave.push(renewalDoc);
              }
              if (offboardingDoc) {
                offboardingDoc.assigned_support_agent = updateUserBody.onboardingDetails.assigned_support_agent;
                documentsToSave.push(offboardingDoc);
              }
              if (visaProcessDoc) {
                visaProcessDoc.assigned_support_agent = updateUserBody.onboardingDetails.assigned_support_agent;
                documentsToSave.push(visaProcessDoc);
              }
              break;
            case 'assigned_insurance_agent':
              onboardingDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
              documentsToSave.push(onboardingDoc);
              if (renewalDoc) {
                renewalDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
                documentsToSave.push(renewalDoc);
              }
              if (offboardingDoc) {
                offboardingDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
                documentsToSave.push(offboardingDoc);
              }
              if (visaProcessDoc) {
                visaProcessDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
                documentsToSave.push(visaProcessDoc);
              }
              break;
            case 'assigned_escalation_manager':
              onboardingDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
              documentsToSave.push(onboardingDoc);
              if (renewalDoc) {
                renewalDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
                documentsToSave.push(renewalDoc);
              }
              if (offboardingDoc) {
                offboardingDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
                documentsToSave.push(offboardingDoc);
              }
              if (visaProcessDoc) {
                visaProcessDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
                documentsToSave.push(visaProcessDoc);
              }
              break;
            case 'assigned_hr_specialist':
              onboardingDoc.assigned_hr_specialist = updateUserBody.onboardingDetails.assigned_hr_specialist;
              documentsToSave.push(onboardingDoc);
              if (renewalDoc) {
                renewalDoc.assigned_hr_specialist = updateUserBody.onboardingDetails.assigned_hr_specialist;
                documentsToSave.push(renewalDoc);
              }
              if (offboardingDoc) {
                offboardingDoc.assigned_hr_specialist = updateUserBody.onboardingDetails.assigned_hr_specialist;
                documentsToSave.push(offboardingDoc);
              }
              if (visaProcessDoc) {
                visaProcessDoc.assigned_hr_specialist = updateUserBody.onboardingDetails.assigned_hr_specialist;
                documentsToSave.push(visaProcessDoc);
              }
              break;
            default:
              break;
          }
        });
      }

      // Save all modified documents
      for (const doc of new Set(documentsToSave)) {
        await doc.save();
      }
    }

    if (updateUserBody.bank) {
      console.log('updating bank details starting at this point------------------------------------>');
      // Extract all keys from the bank object dynamically
      const fieldsToCheck = Object.keys(userDoc.bank);

      // Extract only these fields from the original and updated data
      const originalBankData = fieldsToCheck.reduce((acc, field) => {
        acc[field] = userDoc.bank[field];
        return acc;
      }, {});

      const updatedBankData = fieldsToCheck.reduce((acc, field) => {
        acc[field] = updateUserBody.bank[field];
        return acc;
      }, {});

      // Find differences between the original and updated bank details
      const differences = diff(originalBankData, updatedBankData);
      console.log(differences, 'these are the differences from bank details change');

      // Only proceed if there are changes in the fieldsToCheck
      if (Object.keys(differences).length > 0) {
        console.log('sending bank details changed email=================================================');

        // Create a mapping of field names to their reconstructed body keys
        const fieldMapping = {
          account_number: ['previousAccountNumber', 'updatedAccountNumber'],
          bank_name: ['previousBankName', 'updatedBankName'],
          mol_wps_no: ['previousMOLWPSNumber', 'updatedMOLWPSNumber'],
          iban: ['previousIban', 'updatedIban'],
          bank_post_office: ['previousBankPostOffice', 'updatedBankPostOffice'],
          bank_address: ['previousBankAddress', 'updatedBankAddress'],
          salary_payment_mode: ['previousSalaryPaymentMode', 'updatedSalaryPaymentMode'],
          routing_code: ['previousRoutingCode', 'updatedRoutingCode'],
          sub_salary_payment_mode: ['previousSubSalaryPaymentMode', 'updatedSubSalaryPaymentMode']
        };

        // Initialize reconstructed body with only changed fields
        const reconstructedBody = {
          bank: Object.keys(differences).reduce((acc, field) => {
            if (fieldMapping[field]) {
              acc[fieldMapping[field][0]] = userDoc.bank[field];
              acc[fieldMapping[field][1]] = updateUserBody.bank[field];
            }
            return acc;
          }, {})
        };

        const searchQuery = {
          templateName: 'Bank Details Changed'
        };

        const emailTemplt = await emailTemplateService.getEmailTemplateByName(searchQuery);
        if (!emailTemplt) {
          throw new Error('Could not send Bank Details Changed notification. No template with this name was found!');
        }

        const onboardingDoc = await Onboardings.findOne({ is_deleted: false, user_id: userDoc._id });
        if (!onboardingDoc) console.log('Could not find onboarding for this employee------------>');

        const replacedTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
          emailTemplt._id,
          onboardingDoc ? onboardingDoc.user_id : userId,
          reconstructedBody,
          false,
          (userModule = true)
        );

        await sendRawEmail(replacedTemplate.to, replacedTemplate.subject, replacedTemplate.content, replacedTemplate.cc, []);
      }
    }

    // Create the final update object
    const updateQuery = {
      $set: updatableFields,
      ...operatorsToApply // Spread the operators to apply at the top level of the update
    };

    // Only include $push if it was defined
    if (Object.keys(updateQuery).length === 1 && Object.keys(updateQuery.$set).length === 0) {
      delete updateQuery.$set;
    }

    await Users.findOneAndUpdate({ _id: userId }, updateQuery, { new: true, runValidators: true });
    /**
     * Handle salary transfer and salary clearance documents
     */
    const salaryTransferType = await DocumentTypes.findOne({ name: 'Salary Transfer Letter', is_deleted: false });
    const salaryClearanceType = await DocumentTypes.findOne({ name: 'Salary Clearance Letter', is_deleted: false });
    if (!salaryTransferType) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Transfer Letter Document Type');
    }
    if (!salaryClearanceType) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Clearance Letter Document Type');
    }
    const updatedBankDetails = diff(userDoc.bank, updateUserBody.bank);
    //check if bank details have been changed
    if (Object.keys(updatedBankDetails).length > 0) {
      // await Documents.updateMany(
      //   { type: salaryClearanceType._id, is_deleted: false, foreign_id: ObjectId(userId) },
      //   { $set: { is_deleted: true } }
      // );

      // await Documents.updateMany(
      //   { type: salaryTransferType._id, is_deleted: false, foreign_id: ObjectId(userId) },
      //   { $set: { is_deleted: true } }
      // );
      userDoc.uploadedSalaryClearance = false;
      userDoc.uploadedSalaryTransfer = false;
      await userDoc.save();
    }

    console.log('before error');
    const data = await getUserById(userId);
    console.log(data, 'end of data');
    return data;
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error to be caught by the caller
  }
};
const updateUserOnId = async (userId, updateUserBody, logUserId, logUserName) => {
  try {
    const userResult = await getUserById(userId);
    if (!userResult) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User Not found');
    }

    let updatableFields = {};
    let operatorsToApply = {}; // New object to store pipeline operators like $push

    // Process nested objects
    for (const [key, value] of Object.entries(updateUserBody)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle salary as a complete object, not individual fields
        if (key === 'salary') {
          updatableFields[key] = value;
        } else {
          // For other nested objects, flatten them
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            updatableFields[`${key}.${nestedKey}`] = nestedValue;
          }
        }
      } else {
        updatableFields[key] = value;
      }
    }

    // Handle salary update separately
    let userDoc = await Users.findById(userId);
    let companyDoc = await Companies.findById(userDoc.company_id);

    if (updateUserBody.salary) {
      let updatedFields = diff(userDoc.salary, updateUserBody.salary);
      // Store the $push operation separately
      operatorsToApply['$push'] = {
        salary_change_log: {
          salary: updateUserBody.salary,
          updated_by: logUserId,
          message: `Salary Updated to - ${JSON.stringify(updatedFields)}`,
          status: 'completed',
          updated_user_name: logUserName,
          updated_on: moment.tz('UTC').tz('Asia/Dubai').format()
        }
      };
      // compute previous total salary
      const oldSalary = userDoc.salary.total_fixed;

      const emailParams = {
        first_name: userDoc.first_name,
        last_name: userDoc.last_name,
        email: userDoc.email,
        emp_id: userDoc.emp_id,
        company_name: companyDoc.company_name,
        new_salary: updateUserBody.salary.total_fixed,
        old_salary: oldSalary,
        type: 'salary'
      };
      await emailService.sendsalaryChangeEmail(emailParams);
    }

    // optionally update wage protection system
    if (updateUserBody.nonwps_salary) {
      // console.log(userDoc.nonwps_salary, "WPS")
      const oldSalary = userDoc.nonwps_salary.total_fixed;
      const emailParams = {
        first_name: userDoc.first_name,
        last_name: userDoc.last_name,
        email: userDoc.email,
        emp_id: userDoc.emp_id,
        company_name: companyDoc.company_name,
        new_salary: updateUserBody.nonwps_salary.total_fixed,
        old_salary: oldSalary,
        type: 'nonwps_salary'
      };
      await emailService.sendsalaryChangeEmail(emailParams);
    }
    // optionally update onboarding details
    if (updateUserBody.onboardingDetails) {
      if (updateUserBody.onboardingDetails.assigned_insurance_agent) {
        userDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
        await userDoc.save();
      }
      if (updateUserBody.onboardingDetails.assigned_escalation_manager) {
        userDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
        await userDoc.save();
      }
      const onboardingDoc = await Onboardings.findOne({ _id: userResult.onboardingDetails._id });
      if (!onboardingDoc) console.log(`Could not find onboarding with id ${userResult?.onboardingDetails?._id}`);
      // get support agent email template
      if (updateUserBody.onboardingDetails.assigned_support_agent) {
        const supportAgentEmailTemplt = await emailTemplateService.getEmailTemplateByName({
          templateName: 'Support Agent Notification Email'
        });
        if (supportAgentEmailTemplt) {
          // get replaced template
          const reqBody = {
            userDetails: {
              full_name: userDoc.first_name + ' ' + userDoc.last_name,
              email: userDoc.email,
              company_name: companyDoc.company_name,
              employment_type: userDoc.employment.employment_type,
              visa_sponsor_type: userDoc.employment.visa_sponsor_type,
              phone_number: userDoc.personal.phone
            }
          };
          const replacedTemplt = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
            supportAgentEmailTemplt._id,
            userId,
            // updateUserBody.onboardingDetails.assigned_support_agent,
            reqBody,
            null,
            null
          );
          await sendRawEmail(replacedTemplt.to, replacedTemplt.subject, replacedTemplt.content, replacedTemplt.cc, []);
          // find insurance agent
          if (
            updateUserBody.onboardingDetails.assigned_insurance_agent &&
            ((typeof updateUserBody.onboardingDetails.assigned_insurance_agent === 'string' &&
              updateUserBody.onboardingDetails.assigned_insurance_agent.trim() !== '') ||
              (typeof updateUserBody.onboardingDetails.assigned_insurance_agent === 'object' &&
                updateUserBody.onboardingDetails.assigned_insurance_agent._id))
          ) {
            const insuranceAgents = await getInsuranceAgents();
            console.log('$$$$$$$$$$$$$$$$$$$$$$', insuranceAgents.data, '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
            if (insuranceAgents.data && insuranceAgents.data.length > 0) {
              console.log('console inside block', insuranceAgents.data);
              console.log(typeof insuranceAgents.data, insuranceAgents.data.length, 'is the length');
              const assignedAgentId =
                typeof updateUserBody.onboardingDetails.assigned_insurance_agent === 'string'
                  ? updateUserBody.onboardingDetails.assigned_insurance_agent
                  : updateUserBody.onboardingDetails.assigned_insurance_agent._id;

              console.log('Assigned agent ID:', assignedAgentId);

              const agentDetails = insuranceAgents.data.find(data => data._id === assignedAgentId);
              console.log('found the agent', JSON.stringify(agentDetails));
              userDoc.insurance_agent = {
                _id: agentDetails._id,
                full_name: agentDetails?.full_name,
                email: agentDetails?.email
              };
              userDoc.assigned_insurance_agent = agentDetails._id;
              await userDoc.save();

              let response;
              if (
                userDoc.employment.employment_type == 'Work Permit (for UAE Resident visa holders)' ||
                (userDoc.employment.employment_type == 'Employment Visa (2-Year)' &&
                  userDoc.employment.visa_sponsor_type === 'Dynamic Employment Services')
              ) {
                let insuranceInquiryBody = {
                  source: 'PEO Services',
                  user_id: userDoc._id.toString(),
                  company_id: '6870f7405f5bf4fcc832afd0' || userDoc.company_id.toString(),
                  request_mail_id: agentDetails?.email || 'sahiba@nathanhr.com',
                  agent_id: agentDetails?._id || updateUserBody.onboardingDetails.assigned_insurance_agent,
                  parent_company_id: config.parentCompanyIds.dynamicEmploymentServices
                };
                try {
                  const systemConfig = await Configurations.find({ is_deleted: false }).sort({ _id: -1 }).limit(1);
                  if (!systemConfig || systemConfig.length === 0) throw new Error('System Configurations not found');

                  if (systemConfig[0].mailTrap.trap == true) {
                    response = await axios.post(
                      'https://insurance-api-staging.devnhr.com/insurance/crm/getnewlead',
                      insuranceInquiryBody
                    );
                    console.log('response from insurance api staging', response.data);
                  } else if (systemConfig[0].mailTrap.trap == false) {
                    response = await axios.post(
                      `${config.insurancePortalUrl}insurance/crm/getnewlead`,
                      insuranceInquiryBody
                    );
                    console.log('response from insurance api', response.data);
                  }

                  const insuranceInquiry = response.data;
                  console.log('insurance inquiry created', insuranceInquiry);
                } catch (error) {
                  console.log('error in creating insurance inquiry', error);
                  // throw error;
                }
              }
            }
          }
        }
      }
      const offboardingDoc = await Offboardings.findOne({ user_id: userDoc._id });
      const renewalDoc = await Renewals.findOne({ user_id: userDoc._id });
      const visaProcessDoc = await VisaProcess.findOne({ user_id: userDoc._id });

      const documentsToSave = [];

      // Get the keys from onboardingDetails to iterate over them
      const onboardingKeys = Object.keys(updateUserBody.onboardingDetails);

      // Iterate over each key to update relevant documents
      if (onboardingDoc) {
        onboardingKeys.forEach(key => {
          switch (key) {
            case 'medical_center':
              onboardingDoc.medical_center = updateUserBody.onboardingDetails.medical_center;
              onboardingDoc.markModified('medical_center');
              documentsToSave.push(onboardingDoc);
              break;
            case 'eid_center':
              onboardingDoc.eid_center = updateUserBody.onboardingDetails.eid_center;
              onboardingDoc.markModified('eid_center');
              documentsToSave.push(onboardingDoc);
              break;
            case 'tawjeeh_center':
              onboardingDoc.tawjeeh_center = updateUserBody.onboardingDetails.tawjeeh_center;
              onboardingDoc.markModified('tawjeeh_center');
              documentsToSave.push(onboardingDoc);
              break;
            case 'assigned_pro':
              onboardingDoc.assigned_pro = updateUserBody.onboardingDetails.assigned_pro;
              documentsToSave.push(onboardingDoc);
              break;
            case 'assigned_support_agent':
              onboardingDoc.assigned_support_agent = updateUserBody.onboardingDetails.assigned_support_agent;
              documentsToSave.push(onboardingDoc);
              if (renewalDoc) {
                renewalDoc.assigned_support_agent = updateUserBody.onboardingDetails.assigned_support_agent;
                documentsToSave.push(renewalDoc);
              }
              if (offboardingDoc) {
                offboardingDoc.assigned_support_agent = updateUserBody.onboardingDetails.assigned_support_agent;
                documentsToSave.push(offboardingDoc);
              }
              if (visaProcessDoc) {
                visaProcessDoc.assigned_support_agent = updateUserBody.onboardingDetails.assigned_support_agent;
                documentsToSave.push(visaProcessDoc);
              }
              break;
            case 'assigned_insurance_agent':
              onboardingDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
              documentsToSave.push(onboardingDoc);
              if (renewalDoc) {
                renewalDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
                documentsToSave.push(renewalDoc);
              }
              if (offboardingDoc) {
                offboardingDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
                documentsToSave.push(offboardingDoc);
              }
              if (visaProcessDoc) {
                visaProcessDoc.assigned_insurance_agent = updateUserBody.onboardingDetails.assigned_insurance_agent;
                documentsToSave.push(visaProcessDoc);
              }
              break;
            case 'assigned_escalation_manager':
              onboardingDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
              documentsToSave.push(onboardingDoc);
              if (renewalDoc) {
                renewalDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
                documentsToSave.push(renewalDoc);
              }
              if (offboardingDoc) {
                offboardingDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
                documentsToSave.push(offboardingDoc);
              }
              if (visaProcessDoc) {
                visaProcessDoc.assigned_escalation_manager = updateUserBody.onboardingDetails.assigned_escalation_manager;
                documentsToSave.push(visaProcessDoc);
              }
              break;
            case 'assigned_hr_specialist':
              onboardingDoc.assigned_hr_specialist = updateUserBody.onboardingDetails.assigned_hr_specialist;
              documentsToSave.push(onboardingDoc);
              if (renewalDoc) {
                renewalDoc.assigned_hr_specialist = updateUserBody.onboardingDetails.assigned_hr_specialist;
                documentsToSave.push(renewalDoc);
              }
              if (offboardingDoc) {
                offboardingDoc.assigned_hr_specialist = updateUserBody.onboardingDetails.assigned_hr_specialist;
                documentsToSave.push(offboardingDoc);
              }
              if (visaProcessDoc) {
                visaProcessDoc.assigned_hr_specialist = updateUserBody.onboardingDetails.assigned_hr_specialist;
                documentsToSave.push(visaProcessDoc);
              }
              break;
            default:
              break;
          }
        });
      }

      // Save all modified documents
      for (const doc of new Set(documentsToSave)) {
        await doc.save();
      }
    }

    if (updateUserBody.bank) {
      console.log('updating bank details starting at this point------------------------------------>');

      // Make sure userDoc.bank exists before accessing its keys
      if (!userDoc.bank) {
        userDoc.bank = {};
      }

      // Get all possible bank fields from both objects
      const allBankFields = [...new Set([...Object.keys(userDoc.bank || {}), ...Object.keys(updateUserBody.bank || {})])];

      // Extract only these fields from the original and updated data
      const originalBankData = allBankFields.reduce((acc, field) => {
        acc[field] = userDoc.bank[field] !== undefined ? userDoc.bank[field] : null;
        return acc;
      }, {});

      const updatedBankData = allBankFields.reduce((acc, field) => {
        acc[field] = updateUserBody.bank[field] !== undefined ? updateUserBody.bank[field] : originalBankData[field];
        return acc;
      }, {});

      // Find differences between the original and updated bank details
      const differences = diff(originalBankData, updatedBankData);
      console.log(differences, 'these are the differences from bank details change');

      // Only proceed if there are changes in the bank fields
      if (differences && Object.keys(differences).length > 0) {
        console.log('sending bank details changed email=================================================');

        // Create a mapping of field names to their reconstructed body keys
        const fieldMapping = {
          account_number: ['previousAccountNumber', 'updatedAccountNumber'],
          bank_name: ['previousBankName', 'updatedBankName'],
          mol_wps_no: ['previousMOLWPSNumber', 'updatedMOLWPSNumber'],
          iban: ['previousIban', 'updatedIban'],
          bank_post_office: ['previousBankPostOffice', 'updatedBankPostOffice'],
          bank_address: ['previousBankAddress', 'updatedBankAddress'],
          salary_payment_mode: ['previousSalaryPaymentMode', 'updatedSalaryPaymentMode'],
          routing_code: ['previousRoutingCode', 'updatedRoutingCode'],
          sub_salary_payment_mode: ['previousSubSalaryPaymentMode', 'updatedSubSalaryPaymentMode']
        };

        // Initialize reconstructed body with only changed fields
        const reconstructedBody = {
          bank: Object.keys(differences).reduce((acc, field) => {
            if (fieldMapping[field]) {
              acc[fieldMapping[field][0]] = originalBankData[field];
              acc[fieldMapping[field][1]] = updatedBankData[field];
            }
            return acc;
          }, {})
        };

        try {
          const searchQuery = {
            templateName: 'Bank Details Changed'
          };

          const emailTemplt = await emailTemplateService.getEmailTemplateByName(searchQuery);
          if (!emailTemplt) {
            console.warn('Could not send Bank Details Changed notification. No template with this name was found!');
          } else {
            const onboardingDoc = await Onboardings.findOne({ is_deleted: false, user_id: userDoc._id });
            if (!onboardingDoc) console.log('Could not find onboarding for this employee------------>');

            const replacedTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
              emailTemplt._id,
              onboardingDoc ? onboardingDoc.user_id : userId,
              reconstructedBody,
              false,
              (userModule = true)
            );

            await sendRawEmail(
              replacedTemplate.to,
              replacedTemplate.subject,
              replacedTemplate.content,
              replacedTemplate.cc,
              []
            );
          }
        } catch (emailError) {
          // console.error('Error sending bank details change email:', emailError);
          // Continue with the update process even if email sending fails
        }

        // Mark salary documents as invalid when bank details change
        userDoc.uploadedSalaryClearance = false;
        userDoc.uploadedSalaryTransfer = false;
        await userDoc.save();
      }
    }

    // Create the final update object
    const updateQuery = {
      $set: updatableFields,
      ...operatorsToApply // Spread the operators to apply at the top level of the update
    };

    // Only include $push if it was defined
    if (Object.keys(updateQuery).length === 1 && Object.keys(updateQuery.$set).length === 0) {
      delete updateQuery.$set;
    }

    await Users.findOneAndUpdate({ _id: userId }, updateQuery, { new: true, runValidators: true });
    /**
     * Handle salary transfer and salary clearance documents
     */
    const salaryTransferType = await DocumentTypes.findOne({ name: 'Salary Transfer Letter', is_deleted: false });
    const salaryClearanceType = await DocumentTypes.findOne({ name: 'Salary Clearance Letter', is_deleted: false });
    if (!salaryTransferType) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Transfer Letter Document Type');
    }
    if (!salaryClearanceType) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Clearance Letter Document Type');
    }

    const updatedBankDetails = diff(userDoc.bank || {}, updateUserBody.bank || {});
    //check if bank details have been changed
    if (updatedBankDetails && Object.keys(updatedBankDetails).length > 0) {
      // await Documents.updateMany(
      //   { type: salaryClearanceType._id, is_deleted: false, foreign_id: ObjectId(userId) },
      //   { $set: { is_deleted: true } }
      // );

      // await Documents.updateMany(
      //   { type: salaryTransferType._id, is_deleted: false, foreign_id: ObjectId(userId) },
      //   { $set: { is_deleted: true } }
      // );
      userDoc.uploadedSalaryClearance = false;
      userDoc.uploadedSalaryTransfer = false;
      await userDoc.save();
    }

    console.log('before error');
    const data = await getUserById(userId);
    console.log(data, 'end of data');
    return data;
  } catch (error) {
    console.log(error);
    throw error; // Re-throw the error to be caught by the caller
  }
};
const deleteUserOnId = async userId => {
  let user = await Users.findByIdAndUpdate({ _id: ObjectId(userId) }, { is_deleted: true });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete User');
  }
  return user;
};

const updateUpdatedBy = async userId => {
  return Users.findOneAndUpdate({ _id: userId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async userId => {
  return Users.findOneAndUpdate({ _id: userId }, { $set: { created_by: userId } });
};

//GET Details for the listing Page
const userDetailsForEmpListingPage = async (userBody, page, limit) => {
  let pipeline = [
    {
      $match: {
        is_deleted: false
      }
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        designation: 1,
        contact_number: 1,
        image_url: 1,
        user_status: 1
      }
    }
  ];
  if (userBody.selected_company_id) {
    pipeline.unshift(...queryService(userBody));
  }
  let users = await Users.aggregate(pipeline);
  let usersResult = pagination(users, page, limit, ['first_name', '_id']);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }
  return usersResult;
};

//GET Details on ID
const userDetailsForEmpPageOnId = async (userId, userBody) => {
  let pipeline = [
    {
      $match: {
        _id: ObjectId(userId),
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
        from: 'roles',
        localField: 'role_ID',
        foreignField: '_id',
        as: 'roleDetails'
      }
    },
    {
      $unwind: '$companyDetails'
    },
    {
      $unwind: '$roleDetails'
    },
    {
      $lookup: {
        from: 'documents',
        let: {
          userID: userId,
          unDefined: 'undefined'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$foreign_id', ObjectId(userId)] }, { $ne: ['$document_number', '$$unDefined'] }]
              }
            }
          }
          // {
          //   $limit: 1
          // }
        ],
        as: 'document'
      }
    },
    {
      $addFields: {
        document: {
          $ifNull: [
            '$document',
            {
              name: ''
            }
          ]
        }
      }
    },
    {
      $addFields: {
        newDocument1: {
          passport_no: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$document',
                  as: 'item',
                  cond: {
                    $and: [
                      { $eq: ['$$item.type', ObjectId('64254208e92b0c35c0541ce8')] },
                      { $ne: ['$$item.document_number', null] },
                      { $ne: ['$$item.document_number', ''] }
                    ]
                  }
                }
              },
              0 // Get the first matching document (if it exists)
            ]
            // $filter: {
            //   input: '$document',
            //   as: 'item',
            //   cond: {
            //     $eq: ['$$item.type', ObjectId("64254208e92b0c35c0541ce8")]
            //   },
            // }
          },
          emirates_no: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$document',
                  as: 'item',
                  cond: {
                    $and: [
                      { $eq: ['$$item.type', ObjectId('64229e20bf0f5a1ca8b5117d')] },
                      { $ne: ['$$item.document_number', null] },
                      { $ne: ['$$item.document_number', ''] }
                    ]
                  }
                }
              },
              0 // Get the first matching document (if it exists)
            ]
            // $filter: {
            //   input: '$document',
            //   as: 'item',
            //   cond: {
            //     $eq: ['$$item.type', ObjectId("64254208e92b0c35c0541ce8")]
            //   },
            // }
          }
        }
      }
    },
    {
      $unwind: {
        path: '$newDocument1.passport_no',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$newDocument1.emirates_no',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $set: {
        document: '$newDocument1'
      }
    },
    // {
    //   $addFields: {
    //     total_upfront_costs: {
    //       $reduce: {
    //         input: { $objectToArray: "$companyDetails.upfront_costs" },
    //         initialValue: 0,
    //         in: { $add: ["$$value", { $toDouble: "$$this.v" }] }
    //       }
    //     }
    //   }
    // },
    {
      $addFields: {
        'companyDetails.total_monthly_costs': {
          $reduce: {
            input: { $objectToArray: '$companyDetails.upfront_costs' },
            initialValue: 0,
            in: {
              $add: [
                '$$value',
                {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ['$$this.k', 'monthly_costs'] },
                        { $ne: [{ $type: '$$this.v' }, 'array'] },
                        { $regexMatch: { input: '$$this.v', regex: /^\d+(\.\d+)?$/ } }
                      ]
                    },
                    then: { $toDouble: '$$this.v' },
                    else: 0
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        document: 1,
        _id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        email: 1,
        designation: 1,
        contact_number: 1,
        contract_type: 1,
        work_location: 1,
        employment_type: 1,
        process_type: 1,
        date_of_joining: 1,
        emp_id: 1,
        personal: 1,
        insurance: 1,
        employment: 1,
        emergency: 1,
        bank: 1,
        documents: 1,
        reporting: 1,
        onboarding: 1,
        leaves: 1,
        salary: 1,
        nonwps_salary: 1,
        salary_change_log: 1,
        company_id: 1,
        role_ID: 1,
        user_status: 1,
        payroll_details: 1,
        dependent_details: 1,
        place_of_registration: 1,
        dob: 1,
        image_url: 1,
        updated_date: 1,
        company_email: '$companyDetails.email',
        company_website: '$companyDetails.website',
        company_registration_number: '$companyDetails.registration_number',
        company_phone: '$companyDetails.phone',
        company_email: '$companyDetails.email',
        company_country: '$companyDetails.country',
        company_address: '$companyDetails.address',
        company_name: '$companyDetails.company_name',
        company_logo: '$companyDetails.logo',
        legal_name: '$companyDetails.legal_name',
        company_locations: '$companyDetails.locations',
        company_contact_person: '$companyDetails.contact_person',
        company_available_insurances: '$companyDetails.available_insurances',
        company_bank_details: '$companyDetails.bank_details',
        role_name: '$roleDetails.role_name',
        passport_no: '$newDocument1.passport_no.document_number',
        emirates_no: '$newDocument1.emirates_no.document_number',
        upfront_costs: '$companyDetails.upfront_costs',
        total_upfront_costs: '$companyDetails.total_monthly_costs',
        assigned_insurance_agent: 1,
        uploadedSalaryTransfer: 1,
        uploadedSalaryClearance: 1,
        salary_rotation_required: 1,
        is_internal_staff: 1
      }
    }
  ];
  if (userBody.selected_company_id) {
    pipeline.unshift(...queryService(userBody));
  }
  let users = await Users.aggregate(pipeline);
  const insuranceAgents = await getInsuranceAgents();
  // console.log('start of insurance agents', insuranceAgents, 'end of insurance agents');
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }
  assigned_insurance_agent_details = insuranceAgents.data.find(agent => agent._id == users[0].assigned_insurance_agent);
  users[0].assigned_insurance_agent = assigned_insurance_agent_details;
  const salaryTransferType = await DocumentTypes.findOne({ name: 'Salary Transfer Letter', is_deleted: false });
  const salaryClearanceType = await DocumentTypes.findOne({ name: 'Salary Clearance Letter', is_deleted: false });
  if (!salaryTransferType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Transfer Letter Document Type');
  }
  if (!salaryClearanceType) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Clearance Letter Document Type');
  }
  const salaryTransferDoc = await Documents.find({
    foreign_id: ObjectId(userId),
    type: salaryTransferType._id,
    is_deleted: false
  });
  const salaryClearanceDoc = await Documents.find({
    foreign_id: ObjectId(userId),
    type: salaryClearanceType._id,
    is_deleted: false
  });
  if (!salaryTransferDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Salary Transfer Letter Document');
  }
  if (salaryTransferDoc && salaryTransferDoc.length > 0) {
    console.log('found salary transfer documents exiting process========================>');
    // users[0].uploadedSalaryTransfer = true;
    users[0].salaryTransferDocument = [salaryTransferDoc[salaryTransferDoc.length - 1]];
  } else {
    // users[0].uploadedSalaryTransfer = false;
    users[0].salaryTransferDocument = [];
  }
  if (salaryClearanceDoc && salaryClearanceDoc.length > 0) {
    // users[0].uploadedSalaryClearance = true;
    users[0].salaryClearanceDocument = [salaryClearanceDoc[salaryClearanceDoc.length - 1]];
  } else {
    // users[0].uploadedSalaryClearance = false;
    users[0].salaryClearanceDocument = [];
  }
  return users;
};

const addAdditionalCostsToUserOnId = async () => {};
//GET Details on ID
const allUsersNameCompanyImg = async (userBody, page, limit) => {
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
      $unwind: '$companyDetails'
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        image_url: 1,
        company_name: '$companyDetails.company_name'
      }
    }
  ];
  if (userBody.selected_company_id) {
    pipeline.unshift(...queryService(userBody));
  }
  let users = await Users.aggregate(pipeline);
  let usersResult = pagination(users, page, limit, ['first_name', '_id']);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }
  return usersResult;
};

//Get the counts of total , active, inactive, added today
const countsOfDifferentUsers = async userBody => {
  try {
    let pipeline = [
      {
        $match: {
          is_deleted: false
        }
      },
      {
        $group: {
          _id: null,
          total_users: { $sum: 1 },
          active_users: {
            $sum: {
              $cond: {
                if: { $in: ['$user_status', ['active', 'onboarding', 'new visa process']] },
                then: 1,
                else: 0
              }
            }
          },
          inactive_users: {
            $sum: {
              $cond: {
                if: { $eq: ['$user_status', 'inactive'] },
                then: 1,
                else: 0
              }
            }
          },
          new_users_added_today: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                    { $lt: ['$createdAt', new Date(new Date().setHours(23, 59, 59, 999))] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          },
          Withdraw: {
            $sum: {
              $cond: {
                if: { $eq: ['$user_status', 'Withdraw'] },
                then: 1,
                else: 0
              }
            }
          }
        }
      }
    ];
    if (userBody.selected_company_id) {
      userBody.userFilter = true;
      pipeline.unshift(...queryService(userBody));
    }
    const usersCount = await Users.aggregate(pipeline);
    if (usersCount == []) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find the Data');
    }
    return usersCount;
  } catch (error) {
    throw new error();
  }
};

const userDetailsOnUserID = async (userBody, page, limit) => {
  let pipeline = [
    {
      $match: {
        is_deleted: false
      }
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        designation: 1,
        contact_number: 1,
        image_url: 1,
        user_status: 1
      }
    }
  ];
  if (userBody.selected_company_id) {
    pipeline.unshift(...queryService(userBody));
  }
  let users = await Users.aggregate(pipeline);
  let usersResult = pagination(users, page, limit, ['first_name', '_id']);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }
  return usersResult;
};
const handleOtpFlow = async (user, isPoc = false) => {
  try {
    // Invalidate any existing unverified OTPs for the user
    const existingOtp = await Otp.findOne({ user: user._id, is_verified: false });
    if (existingOtp) {
      await Otp.findOneAndUpdate({ _id: existingOtp._id }, { $set: { is_verified: false } });
    }

    // Generate a new OTP
    const generatedOtp = otpService.GenerateOtp();
    const otpObject = {
      otp: generatedOtp,
      date: moment().toISOString(),
      is_verified: false,
      user: user._id
    };

    const newOtp = await Otp.create(otpObject);
    if (!newOtp) throw new Error('Could not create OTP');

    // Fetch email template and send OTP email
    const emailTemplt = await emailTemplate.findOne({ name: 'OTP Generated' });
    if (!emailTemplt) throw new Error('Could not find OTP email template');
    console.log('constructing email body');
    const emailBody = { otp: generatedOtp };
    if (!isPoc) {
      const replacedEmailTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
        emailTemplt._id,
        user._id,
        emailBody,
        false,
        false
      );

      if (replacedEmailTemplate) {
        await sendRawEmail([user.email], replacedEmailTemplate.subject, replacedEmailTemplate.content, [], [], null);
      }
    } else {
      console.log('else condition executing');
      await emailService.clientOTPEmail(user, newOtp);
    }

    return {
      message: 'A One-time password (OTP) has been sent to your email. Complete verification to proceed.',
      user: user.email,
      id: newOtp._id
    };
  } catch (error) {
    console.error('Error in handleOtpFlow:', error.message);
    throw new Error(error.message || 'An error occurred during OTP generation');
  }
};
const ClientLoginFlow = async reqBody => {
  const { email } = reqBody;
  try {
    let user;
    // const user = await Users.findOne({ email });
    user = await Poc.findOne({ email: email, is_deleted: false });
    if (!user) {
      /**
       * Alternatively search for super admins to grant access
       * Super admins should be able to login regardless
       */
      const superAdminRole = await Role.findOne({ role_name: 'Super Admin' });
      if (!superAdminRole) {
        return;
      }
      user = await Users.findOne({ email, role_ID: superAdminRole._id });
      if (!user) {
        return;
      }
    }

    const response = await handleOtpFlow(user, true);

    return response;
  } catch (error) {
    console.error('Error in ClientLoginFlow:', error?.message);
    throw new Error({ message: error.message || 'An error occurred' });
  }
};

const VerifyOtpAndLogin = async body => {
  const { email, otp, otpId, isPoc } = body;
  try {
    const isOtpVerified = await otpService.verifyOtp(otp, otpId);
    if (!isOtpVerified) {
      throw new Error('Invalid OTP');
    }

    if (!isPoc) {
      const user = await Users.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.firstLogin) {
        user.firstLogin = false;
        user.lastLogin = new Date();
        await user.save();
      }
      //find company data
      const company = await Companies.findById(user.company_id);
      const tokens = await user.generateAuthTokens(user);
      return {
        success: true,
        message: 'Login successful',
        tokens,
        user: {
          ...user._doc,
          first_name: user.first_name,
          last_name: user.last_name
        },
        details_updated: company?.details_updated || false
      };
    } else {
      const user = await Poc.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      const company = await Companies.findById(user.company_id);
      const tokens = await user.generateAuthTokens(user);
      const [first_name, ...lastNameParts] = user.name.split(' ');
      const last_name = lastNameParts.join(' ');

      return {
        success: true,
        message: 'Login successful',
        tokens,
        user: {
          ...user._doc,
          first_name,
          last_name,
          image_url: user.image_url || null
        },
        details_updated: company?.details_updated || false
      };
    }
  } catch (error) {
    throw new Error(error.message || 'An error occurred during OTP authentication');
  }
};

const verifyOtpAndLogin = async body => {
  const { email, otp, otpId, isPoc } = body;
  try {
    const isOtpVerified = await otpService.verifyOtp(otp, otpId);
    if (!isOtpVerified) {
      throw new Error('Invalid OTP');
    }

    if (!isPoc) {
      // First, check the Users model
      let user = await Users.findOne({ email, user_status: { $nin: ['offboarding'] } });
      if (!user) {
        throw new Error('User not found');
      }
      if(user.is_internal_staff && user.is_internal_staff === false && user.hasPortalAccess === false){
        throw new Error('Access denied!')
      }
      if (user.firstLogin) {
        user.firstLogin = false;
        user.lastLogin = new Date();
        await user.save();
      }

      // Find company data
      const company = await Companies.findById(user.company_id);
      const tokens = await user.generateAuthTokens(user);

      // Add role information to user object
      // Convert to Mongoose model instance to access checkRole method
      const userModel = new Users(user);
      await userModel.checkRole();
      user = userModel;

      return {
        success: true,
        message: 'Login successful',
        tokens,
        user: {
          ...user._doc,
          first_name: user.first_name,
          last_name: user.last_name
        },
        details_updated: company?.details_updated || false
      };
    } else {
      // Check Poc first
      let user = await Poc.findOne({ email:email, status:{$ne:'inactive'} });
      let isPocUser = true;

      if (!user) {
        // If not found in Poc, check for a Super Admin role
        const superAdminRole = await Role.findOne({ role_name: 'Super Admin' });
        if (!superAdminRole) {
          throw new Error('Super Admin role not found');
        }

        user = await Users.findOne({
          email,
          role_ID: superAdminRole._id
        });

        if (!user) {
          throw new Error('User not found');
        }
        isPocUser = false;
      }

      // Find company data and generate tokens
      const company = await Companies.findById(user.company_id);
      const tokens = await user.generateAuthTokens(user);

      let first_name, last_name;

      if (isPocUser) {
        // Handle POC user - they have a 'name' field
        const [parsed_first_name, ...lastNameParts] = user.name?.split(' ') || [];
        first_name = parsed_first_name || '';
        last_name = lastNameParts.join(' ') || '';

      } else {
        // Handle Super Admin user from Users model
        const userModel = new Users(user);
        await userModel.checkRole();
        user = userModel;

        first_name = user.first_name || '';
        last_name = user.last_name || '';
      }

      return {
        success: true,
        message: 'Login successful',
        tokens,
        user: {
          ...user._doc,
          first_name,
          last_name,
          image_url: user.image_url || null
        },
        details_updated: company?.details_updated || false
      };
    }
  } catch (error) {
    throw new Error(error.message || 'An error occurred during OTP authentication');
  }
};

const userLogin = async body => {
  try {
    const { email, password, OTPLogin, otp, otpId, isPoc = false } = body;
    if (OTPLogin) {
      if (otp) {
        const response = await verifyOtpAndLogin({ email, otp, otpId, isPoc });

        return response;
      } else {
        throw new Error('OTP is required for company login');
      }
    } else {
      let user = await findByCredentials(email, password);
      const companyDetails = await Companies.findById(user.company_ID);
      console.log(companyDetails, 'the company details', user.company_ID, 'the company id');
      console.log(companyDetails.company_name);

      if (user) {
        const tokens = await user.generateAuthTokens();

        // Add role information to user object
        // Convert to Mongoose model instance to access checkRole method
        const userModel = new Users(user);
        await userModel.checkRole();
        user = userModel;

        const userObject = user.toObject();
        return {
          tokens,
          user: {
            ...userObject,
            companyName: companyDetails.company_name || null
          },
          product_access: []
        };
      } else {
        return false;
      }
    }
  } catch (error) {
    console.log("Second error", error)
    throw new Error(error);
  }
};

const fetchInternalEmployees = async (reqQuery) => {
  try {
    const filter = {
      is_deleted: false,
      is_internal_staff: true
    };
    let searchRegex;
    if (reqQuery.search && reqQuery.search.trim() !== '') {
      searchRegex = new RegExp(reqQuery.search, 'i');
      filter.$or = [{ first_name: searchRegex }, { last_name: searchRegex }, { email: searchRegex }];
    }
    const options = {
      page: reqQuery.page ? parseInt(reqQuery.page, 10) : 1,
      limit: reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10,
      sortBy: reqQuery.sortBy || '_id:-1'
    };

    // Get the main paginated response with specific fields
    const response = await Users.paginate(filter, {
      ...options,
      select: 'first_name last_name middle_name email phone personal employment reporting image_url is_internal_staff company_id company_ID created_at updated_at'
    });

    // Calculate recently added count (within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyAddedFilter = {
      is_deleted: false,
      is_internal_staff: true,
      createdAt: { $gte: thirtyDaysAgo }
    };

    const recentlyAddedCount = await Users.countDocuments(recentlyAddedFilter);

    // Add the recently added count to the response
    response.recentlyAdded = recentlyAddedCount;

    return response;
  } catch (error) {
    throw error;
  }
};

const updateInternalStaff = async (reqBody, selectedUsrId, userId) => {
  try {
    const userDoc = await Users.findById(selectedUsrId);
    if (!userDoc) throw new Error('User not found');
    let designation
    let phone;
    let department;

    if(reqBody.designation){
      designation = reqBody.designation
      delete reqBody.designation;
    }

    if(reqBody.phone){
      phone = reqBody.phone;
      delete reqBody.phone;
    }

    if(reqBody.is_internal_staff && reqBody.is_internal_staff === false){
      reqBody.hasPortalAccess = false
    }
    if(reqBody.department){
      department = reqBody.department
      console.log('Department received in backend:', department);
      delete reqBody.department;
    }

    reqBody = { ...reqBody, updated_by: userId };
    const updates = Object.keys(reqBody);
    updates.forEach(update => {
      userDoc[update] = reqBody[update];
    });

    if(designation && designation.trim() !== ""){
      userDoc.employment.designation = designation;
      userDoc.markModified('employment.designation');
    }
    if(phone && phone.trim() !== ""){
      userDoc.personal.personal_mobile = phone;
      userDoc.markModified('personal.personal_mobile');
    }
    if(department && department.trim() !== ""){
      // Initialize reporting object if it doesn't exist
      if (!userDoc.reporting) {
        userDoc.reporting = {};
      }
      userDoc.reporting.department = department;
      console.log('Department being saved to database:', department);
      // use mark modified on department
      userDoc.markModified('reporting.department');
    }
    await userDoc.save();

    // Return the updated user document with all necessary fields
    return await Users.findById(selectedUsrId).select('first_name last_name middle_name email phone personal employment reporting image_url is_internal_staff company_id company_ID createdAt updatedAt');
  } catch (error) {
    throw error;
  }
};
const createInternalStaff = async (reqBody, userId) => {
  try {
    const userBody = {
      company_id: reqBody.company_id ||'647891f4db2d9a5f80b45179',
      company_ID: reqBody.company_id || '647891f4db2d9a5f80b45179',
      is_internal_staff: true,
      first_name: reqBody.first_name,
      last_name: reqBody.last_name,
      middle_name: reqBody.middle_name,
      email: reqBody.email,
      password: reqBody.password,
      role_ID: '640f1c93be01c2e00bd95084',
      image_url: reqBody.image_url,
      phone: reqBody.phone,
      created_by: userId,
      employment: {
        employment_type: 'Employment Visa (2-Year)',
        designation: reqBody.designation,
        visa_sponsor_type: 'Dynamic Employment Services',
      },
      personal:{
        personal_mobile: reqBody.phone
      },
      reporting: {
        department: reqBody.department || 'Administration'
      }

    };
    return await Users.create(userBody);
  } catch (error) {
    throw error;
  }
};

/**
 * ===================================================================================================================
 * The new user login function handles OTP sign-ups for first logins on the system
 * The function checks if user.firstlOGIN: TRUE, IF so, it generates and sends OTP
 * Note that the current implementation only sends email notifications
 * ===================================================================================================================
 */
const processLogin = async payload => {
  try {
    // Existing login block
    let user = await findByCredentials(payload.email, payload.password);

    if (user) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (user.firstLogin) {
        if (!emailRegex.test(user.email)) {
          throw new Error('Invalid email address!');
        }

        // Generate OTP on first login
        const generatedOtp = otpService.GenerateOtp();
        const otpObject = {
          otp: generatedOtp,
          date: moment().toISOString(),
          is_verified: false,
          user: user._id
        };

        const newOtp = await Otp.create(otpObject);
        if (!newOtp) throw new Error('Could not create OTP');

        const emailTmplt = await emailTemplateService.getEmailTemplateByName({ templateName: 'OTP Generated' });
        if (!emailTmplt) throw new Error('Could not find OTP email template');

        const emailBody = { otp: generatedOtp };
        const replacedEmailTemplt = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
          emailTmplt._id,
          user._id,
          emailBody,
          false,
          false
        );

        if (replacedEmailTemplt) {
          await sendRawEmail(user.email, replacedEmailTemplt.subject, replacedEmailTemplt.content, [], []);
        }

        return {
          message: 'A One-time password (OTP) has been sent to your email. Complete verification to proceed.',
          user: user.email,
          id: newOtp._id
        };
      } else {
        const tokens = await user.generateAuthTokens();
        user = await user.checkRole();
        // conditionally update mobile login metrics
        const updateFields = {};
        if (!user.hasMobileLoggedIn) {
          updateFields.hasMobileLoggedIn = true;
        }

        if (!user.firstMobileLoginDate) {
          updateFields.firstMobileLoginDate = new Date();
        }

        if (Object.keys(updateFields).length > 0) {
          user = await Users.findByIdAndUpdate(user._id, { $set: updateFields }, { new: true });
          if (!user) throw new Error('Could not update Login metrics');
        }

        const isAdmin = user.isAdmin;
        const isEmployee = user.isEmployee;
        const isHR = user.isHR;
        const isManager = user.isManager;
        const isFinanceMgr = user.isFinanceMgr;
        const isHRMgr = user.isHRMgr;
        const isCEO = user.isCEO;
        const isSuperAdmin = user.isSuperAdmin;
        const product_access = [];

        return {
          isAdmin,
          isEmployee,
          isHR,
          isManager,
          isFinanceMgr,
          isHRMgr,
          isCEO,
          isSuperAdmin,
          tokens,
          user,
          product_access
        };
      }
    } else {
      console.log("first error")
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const mobileLogin = async body => {
  const { email, password, otp, otpLogin, resendOtp, id } = body;

  try {
    if (otp) {
      const verificationResponse = await otpService.verifyOtp(otp, id); // id is not needed here anymore

      if (verificationResponse) {
        let user = await Users.findOne({ email });
        if (!user) throw new Error('Invalid credentials!');

        user.firstLogin = false;
        await user.save();

        return {
          success: true,
          otpVerified: true
        };
      } else {
        throw new Error('Could not verify OTP');
      }
    }

    if (resendOtp) {
      let user = await Users.findOne({ email });
      if (!user) throw new Error('User not found');

      // Invalidate the current OTP (if any exists)
      const existingOtp = await Otp.findOne({ user: user._id, is_verified: false });
      if (existingOtp) {
        existingOtp.is_verified = false;
        await existingOtp.save();
      }

      // Generate a new OTP
      const generatedOtp = otpService.GenerateOtp();
      const otpObject = {
        otp: generatedOtp,
        date: moment().toISOString(),
        is_verified: false,
        user: user._id
      };

      const newOtp = await Otp.create(otpObject);
      if (!newOtp) throw new Error('Could not create OTP');

      const emailTmplt = await emailTemplateService.getEmailTemplateByName({
        templateName: 'OTP Generated'
      });
      if (!emailTmplt) throw new Error('Could not find OTP email template');

      const emailBody = { otp: generatedOtp };
      const replacedEmailTemplt = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
        emailTmplt._id,
        user._id,
        emailBody,
        false,
        false
      );

      if (replacedEmailTemplt) {
        await sendRawEmail(user.email, replacedEmailTemplt.subject, replacedEmailTemplt.content, [], []);
      }

      return {
        message: 'A new One-time password (OTP) has been sent to your email. Complete verification to proceed.',
        isFirstLogin: true,
        user: user.email,
        id: newOtp._id
      };
    }

    if (email) {
      // Fetch user by email
      const user = await Users.findOne({ email });
      if (!user) throw new Error('User not found');

      // Check if otpLogin is provided
      if (otpLogin) {
        user.password = password;
        await user.save();
        const loggedInUser = await processLogin(body);
        return loggedInUser;
      }

      if (user.firstLogin) {
        // Generate OTP for first login
        const generatedOtp = otpService.GenerateOtp();
        const otpObject = {
          otp: generatedOtp,
          date: moment().toISOString(),
          is_verified: false,
          user: user._id
        };

        const newOtp = await Otp.create(otpObject);
        if (!newOtp) throw new Error('Could not create OTP');

        const emailTmplt = await emailTemplateService.getEmailTemplateByName({
          templateName: 'OTP Generated'
        });
        if (!emailTmplt) throw new Error('Could not find OTP email template');

        const emailBody = { otp: generatedOtp };
        const replacedEmailTemplt = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
          emailTmplt._id,
          user._id,
          emailBody,
          false,
          false
        );

        if (replacedEmailTemplt) {
          await sendRawEmail(user.email, replacedEmailTemplt.subject, replacedEmailTemplt.content, [], []);
        }

        return {
          message: 'A One-time password (OTP) has been sent to your email. Complete verification to proceed.',
          isFirstLogin: true,
          user: user.email,
          id: newOtp._id
        };
      } else {
        if (!password) {
          return {
            success: true,
            isFirstLogin: false,
            message: 'Please login with password'
          };
        }

        // Authenticate using email and password for non-first logins
        const loggedInUser = await processLogin(body);
        return loggedInUser;
      }
    }

    throw new Error('Invalid login payload');
  } catch (error) {
    throw new Error(error?.message || 'An error occurred during login');
  }
};

const userLoginAzure = async user => {
  if (user) {
    const tokens = await user.generateAuthTokens();
    user = await user.checkRole();

    const isAdmin = user.isAdmin;
    const isEmployee = user.isEmployee;
    const isHR = user.isHR;
    const isManager = user.isManager;
    const isFinanceMgr = user.isFinanceMgr;
    const isHRMgr = user.isHRMgr;
    const isCEO = user.isCEO;
    const isSuperAdmin = user.isSuperAdmin;
    const product_access = [];
    let response = {
      isAdmin,
      isEmployee,
      isHR,
      isManager,
      isFinanceMgr,
      isHRMgr,
      isCEO,
      isSuperAdmin,
      tokens,
      user,
      product_access
    };

    return response;
  } else {
    return null;
  }
};

// const refreshTokens = async (userId) => {
//   const user = await Users.findOne({ "_id": userId })
//   if(user) {
//     const tokens = await user.generateAuthTokens()
//     return tokens
//   } else {
//     return null
//   }
// }

/* User login */
const userCentralLogin = body =>
  new Promise(async (resolve, reject) => {
    let { email, password, type, otp } = body;
    email = email.toLowerCase();
    email = email.trim();
    encrypt_email = CryptoJS.AES.encrypt(email, SECRET_KEY).toString();

    const centralBody = {
      email: encrypt_email,
      product_id: process.env.CENTRAL_DB_PRODUCT_ID,
      type: type,
      otp: otp
    };
    let URL = CENTRAL_URL + 'users/centralLogin';

    await axios
      .post(URL, centralBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(async responseCentral => {
        let product_access = responseCentral.data.data;
        access = product_access.filter(prod => prod.product_id == process.env.CENTRAL_DB_PRODUCT_ID);
        if (responseCentral.data.success && access.length > 0) {
          try {
            if (type == 'O365') {
            } else if (type == 'REDIRECT') {
              let user = await findByEmail(email);
              if (user) {
                const tokens = await user.generateAuthTokens();
                user = await user.checkRole();

                const isAdmin = user.isAdmin;
                const isEmployee = user.isEmployee;
                const isHR = user.isHR;
                const isManager = user.isManager;
                const isFinanceMgr = user.isFinanceMgr;
                const isHRMgr = user.isHRMgr;
                const isCEO = user.isCEO;
                const isSuperAdmin = user.isSuperAdmin;

                let response = {
                  isAdmin,
                  isEmployee,
                  isHR,
                  isManager,
                  isFinanceMgr,
                  isHRMgr,
                  isCEO,
                  isSuperAdmin,
                  tokens,
                  user,
                  product_access
                };
                resolve(response);
              } else {
                return null;
              }
            } else {
              let user = await findByCredentials(email, password);
              if (user) {
                const tokens = await user.generateAuthTokens();
                user = await user.checkRole();

                const isAdmin = user.isAdmin;
                const isEmployee = user.isEmployee;
                const isHR = user.isHR;
                const isManager = user.isManager;
                const isFinanceMgr = user.isFinanceMgr;
                const isHRMgr = user.isHRMgr;
                const isCEO = user.isCEO;
                const isSuperAdmin = user.isSuperAdmin;

                let response = {
                  isAdmin,
                  isEmployee,
                  isHR,
                  isManager,
                  isFinanceMgr,
                  isHRMgr,
                  isCEO,
                  isSuperAdmin,
                  tokens,
                  user,
                  product_access
                };
                resolve(response);
              } else {
                return null;
              }
            }
          } catch (error) {
            console.log(error, '-----------error');
          }
        } else {
          return null;
        }
      });
  });

/* User Central Validation */
const userCentralValidation = body =>
  new Promise(async (resolve, reject) => {
    let { email } = body;
    email = email.toLowerCase();
    email = email.trim();
    let URL = CENTRAL_URL + 'users/centralValidation';
    const centralBody = {
      email: email
    };

    await axios
      .post(URL, centralBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        resolve(response.data.data);
      })
      .catch(e => {
        console.log(e);
      });
  });

// Dynamic Search
const dynamicSearch = async reqBody => {
  const { [reqBody.collection_name]: model } = require('../models');
  if (model) {
    var lookupFields = reqBody.lookup_fields.map(field => {
      return {
        from: field.from,
        localField: field.local_field,
        foreignField: field.foreign_field,
        as: field.as
      };
    });

    var unwindFields = reqBody.unwind_fields.map(field => {
      return {
        path: field.path
      };
    });

    var addFields = {};

    reqBody.add_fields.forEach(field => {
      addFields[field.as] = `$${field.field}`;
    });

    var match = {
      $expr: {
        $regexFind: { input: `$${reqBody.input}`, regex: RegExp(reqBody.regex) }
      }
    };
    var pipeline = [
      ...queryService(reqBody),
      {
        $lookup: {
          from: lookupFields[0].from,
          localField: lookupFields[0].localField,
          foreignField: lookupFields[0].foreignField,
          as: lookupFields[0].as
        }
      },
      {
        $unwind: {
          path: unwindFields[0].path
        }
      },
      {
        $addFields: {
          ...addFields
        }
      }
    ];
    // if (userBody.company_id) {
    //   pipeline.unshift(...queryService(userBody));
    // }
    // Check if a condition is met and add another $lookup stage and $match stage
    if (lookupFields && lookupFields.length && lookupFields.length > 1) {
      pipeline.push({
        $lookup: {
          from: lookupFields[1].from,
          localField: lookupFields[1].localField,
          foreignField: lookupFields[1].foreignField,
          as: lookupFields[1].as
        }
      });
      pipeline.push({
        $unwind: {
          path: unwindFields[1].path
        }
      });
      reqBody.add_more_fields.forEach(field => {
        pipeline.push({
          $addFields: {
            [field.as]: `$${field.field}`
          }
        });
      });
      pipeline.push({
        $match: {
          ...match
        }
      });
    }
    var searchResult = await model.aggregate(pipeline);
    if (!searchResult) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find the Data');
    }
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please Provide the Appropriate Model Name');
  }
  return searchResult;
};

const usersOnStatus = async (statusName, userBody, page, limit) => {
  let pipeline = [
    {
      $match: {
        user_status: statusName,
        is_deleted: false
      }
    }
  ];
  if (userBody.selected_company_id) {
    pipeline.unshift(...queryService(userBody));
  }
  let users = await Users.aggregate(pipeline);
  let usersResult = pagination(users, page, limit, ['first_name', '_id']);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }
  return usersResult;
};

const getUsersBetweenDatesAndStatus = async (reqBody, page, limit) => {
  const query = { is_deleted: false };
  if (reqBody.start_date && reqBody.end_date) {
    const endDate = new Date(reqBody.end_date);
    endDate.setDate(endDate.getDate() + 1);
    query.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) };
  }
  if (reqBody.status) {
    if (Array.isArray(reqBody.status)) {
      query.user_status = { $in: reqBody.status };
    } else {
      query.user_status = reqBody.status;
    }
  }
  const users = await Users.find(query);
  let usersResult = pagination(users, page, limit, ['first_name', '_id']);
  if (users.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }
  return usersResult;
};

const listAllUsersDropDown = async (reqBody, page, limit) => {
  try {
    const employeeRole = await Role.findOne({ role_name: 'Employee' });
    if (!employeeRole) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Employee Role');
    }

    let pipeline = [
      {
        $match: {
          is_deleted: false,
          user_status: { $nin: ['withdrawn', 'offboarding', 'inactive'] }
        }
      },
      {
        $project: {
          _id: 1,
          first_name: 1,
          middle_name: 1,
          last_name: 1,
          image_url: 1,
          company_id: 1
        }
      }
    ];
    if (reqBody.isTicketDropdown) {
      pipeline.unshift({
        $match: {
          role_ID: employeeRole._id
        }
      });
    }
    if (reqBody.selected_company_id) {
      pipeline.unshift(...queryService(reqBody));
    }
    let users = await Users.aggregate(pipeline);
    let usersResult = pagination(users, page, limit, ['first_name', '_id']);

    if (!users) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
    }
    return reqBody.isTicketDropdown ? users : usersResult;
  } catch (error) {
    throw error;
  }
};

const listOfAdminUsers = async reqQuery => {
  const role = await Role.findOne({ role_name: 'Super Admin' });
  let query = {
    is_deleted: false,
    role_ID: role._id
  };
  if (reqQuery.module && reqQuery.module.toLowerCase() == 'leads') {
    query.user_status = { $nin: ['withdrawn', 'offboarding', 'inactive'] };
  }
  let pipeline = [
    {
      $match: query
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        image_url: 1,
        company_id: 1
      }
    }
  ];
  let usersResult = await Users.aggregate(pipeline);
  return usersResult;
};

const getLogin = async req => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    // console.log(token, 'token from headers');
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }
    const option = {
      expiresIn: '2d'
    };
    let result = jwt.verify(token, process.env.JWT_SECRET_API, option);
    // console.log("result from jtw verify", result)
    let userId = result._id;
    let user = await Users.findOne({ _id: ObjectId(userId) });
    if (user) {
      // console.log("found user-------->")
      const tokens = await user.generateAuthTokens();
      user = await user.checkRole();

      const isAdmin = user.isAdmin;
      const isEmployee = user.isEmployee;
      const isHR = user.isHR;
      const isManager = user.isManager;
      const isFinanceMgr = user.isFinanceMgr;
      const isHRMgr = user.isHRMgr;
      const isCEO = user.isCEO;
      const isSuperAdmin = user.isSuperAdmin;
      const product_access = [];
      let response = {
        isAdmin,
        isEmployee,
        isHR,
        isManager,
        isFinanceMgr,
        isHRMgr,
        isCEO,
        isSuperAdmin,
        tokens,
        user,
        product_access
      };
      return response;
    } else {
      console.log('did not find user on get login==============>');
      return null;
    }
  } catch (error) {
    console.log(error);
  }
};

const usersOnCompanyIdListing = async (companyId, page, limit) => {
  let pipeline = [
    {
      $match: {
        company_id: ObjectId(companyId),
        is_deleted: false
      }
    },
    {
      $project: {
        _id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        user_status: 1,
        image_url: 1
      }
    }
  ];
  let users = await Users.aggregate(pipeline);
  let usersResult = pagination(users, page, limit, ['first_name', '_id']);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
  }
  return { usersResult, totalUsers: usersResult.length };
};

const countsOfDifferentUsersOnCompanyID = async companyId => {
  const usersCount = await Users.aggregate([
    {
      $match: {
        company_id: ObjectId(companyId),
        is_deleted: false
      }
    },
    {
      $group: {
        _id: null,
        total_users: { $sum: 1 },
        active_users: {
          $sum: {
            $cond: {
              if: { $eq: ['$user_status', 'active'] },
              then: 1,
              else: 0
            }
          }
        },
        onboarding_users: {
          $sum: {
            $cond: {
              if: { $eq: ['$user_status', 'onboarding'] },
              then: 1,
              else: 0
            }
          }
        },
        active_visa_process: {
          $sum: {
            $cond: {
              if: { $eq: ['$user_status', 'new visa process'] },
              then: 1,
              else: 0
            }
          }
        },
        unpaid_invoice: {
          $sum: {
            $cond: {
              if: { $eq: ['$user_status', 'payment due'] },
              then: 1,
              else: 0
            }
          }
        },
        offboarding_users: {
          $sum: {
            $cond: {
              if: { $eq: ['$user_status', 'offboarding'] },
              then: 1,
              else: 0
            }
          }
        }
      }
    }
  ]);
  if (usersCount == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find the Data');
  }
  return usersCount;
};

const userListingSearchingFilteringAndPagination = async (reqBody, page, limit, search = '') => {
  try {
    const filter = {
      is_deleted: false
    };
    const skip = (page - 1) * limit;
    const options = {
      page,
      limit,
      skip,
      sortBy: 'createdAt:desc'
    };
    let pipeline = [
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'companyDetails'
        }
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'onboardings',
          localField: '_id',
          foreignField: 'user_id',
          as: 'onboardingDetails'
        }
      },
      {
        $unwind: {
          path: '$onboardingDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'onboardingDetails.assigned_pro',
          foreignField: '_id',
          as: 'assignedProDetails'
        }
      },
      {
        $unwind: {
          path: '$assignedProDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          'onboardingDetails.assignedPro': {
            $concat: [
              { $ifNull: ['$assignedProDetails.first_name', ''] },
              {
                $cond: {
                  if: {
                    $gt: [{ $strLenCP: { $ifNull: ['$assignedProDetails.middle_name', ''] } }, 0]
                  },
                  then: { $concat: [' ', { $ifNull: ['$assignedProDetails.middle_name', ''] }] },
                  else: ' '
                }
              },
              { $ifNull: ['$assignedProDetails.last_name', ''] }
            ]
          },
          //add onboarding id
          'onboardingDetails._id': { $ifNull: ['$onboardingDetails._id', ''] },
          'onboardingDetails.status': { $ifNull: ['$onboardingDetails.status', ''] }
        }
      },
      {
        $project: {
          _id: 1,
          first_name: {
            $ifNull: ['$first_name', '']
          },
          middle_name: {
            $ifNull: ['$middle_name', '']
          },
          last_name: {
            $ifNull: ['$last_name', '']
          },
          user_status: 1,
          company_id: 1,
          image_url: {
            $ifNull: ['$image_url', '']
          },
          employment: 1,
          designation: {
            $ifNull: ['$designation', '']
          },
          company_name: '$companyDetails.company_name',
          personal: 1,
          insurance: 1,
          emergency: 1,
          emergency_uae: 1,
          bank: 1,
          leaves: 1,
          salary: 1,
          non_wps_salary: 1,
          gratuity: 1,
          dependent_details: 1,
          insurance_agent: 1,
          reporting: 1,
          monthly_costs: 1,
          payroll_details: 1,
          createdAt: 1,
          upfront_costs: '$companyDetails.upfront_costs',
          'onboardingDetails.assignedPro': 1,
          'onboardingDetails.medical_center': {
            $ifNull: ['$onboardingDetails.medical_center', '']
          },
          'onboardingDetails.eid_center': {
            $ifNull: ['$onboardingDetails.eid_center', '']
          },
          'onboardingDetails.tawjeeh_center': {
            $ifNull: ['$onboardingDetails.tawjeeh_center', '']
          },
          'onboardingDetails.eid_center_fingerprint_time': {
            $ifNull: ['$onboardingDetails.eid_center_fingerprint_time', '']
          },
          'onboardingDetails.eid_center_fingerprint_date': {
            $ifNull: ['$onboardingDetails.eid_center_fingerprint_date', ''] // Handle null fingerprint date
          },
          'onboardingDetails._id': 1, // Include this in your $project stage
          'onboardingDetails.status': 1
        }
      }
    ];
    if (reqBody.company_id && reqBody.company_id.length > 0) {
      const companyId = reqBody.company_id[0]; // Extract the ObjectId string from the array
      pipeline.unshift({
        $match: {
          company_id: ObjectId(companyId) // Convert company_id to ObjectId
        }
      });
    }

    if (reqBody.selected_company_id) {
      reqBody.userFilter = true;
      pipeline.unshift(...queryService(reqBody));
      console.log('pipeline on service', JSON.stringify(pipeline), '$$$$$$$$$$$$$$$$$$$$');
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
    if (reqBody.status) {
      if (Array.isArray(reqBody.status)) {
        pipeline.push({ $match: { user_status: { $in: reqBody.status } } });
      } else {
        pipeline.push({ $match: { user_status: reqBody.status } });
      }
    }

    // Handle search from query parameter or request body
    const searchTerm = search || reqBody.search;
    if (searchTerm && searchTerm.trim() !== '') {
      const searchRegex = new RegExp(searchTerm, 'i');
      pipeline.push({
        $match: {
          $or: [
            { first_name: searchRegex },
            { middle_name: searchRegex },
            { last_name: searchRegex },
            { company_name: searchRegex },
            { email: searchRegex },
            { designation: searchRegex },
            { 'employment.employment_type': searchRegex }
          ]
        }
      });
    }

    let aggregationResult = await Users.paginateLookup(filter, options, pipeline);

    // let usersResult = pagination(aggregationResult.results, page, limit, ['_id', 'first_name'], 'desc');
    const usersResult = aggregationResult.results;
    for (let user of usersResult) {
      if (user.onboardingDetails.eid_center_fingerprint_date && user.onboardingDetails.eid_center_fingerprint_date !== '') {
        user.onboardingDetails.eid_center_fingerprint_date = formatDate(user.onboardingDetails.eid_center_fingerprint_date);
      }
    }
    return Object.assign(aggregationResult, { results: usersResult });
  } catch (error) {
    console.log('error in userListingSearchingFilteringAndPagination', error);
    throw new ApiError(httpStatus.BAD_REQUEST, `Error when fetching users: ' + ${error.message}`);
  }
};

const userListingSearchingFilteringAndPaginationone = async (reqBody, page, limit) => {
  try {
    let pipeline = [];

    // Initial match conditions
    if (reqBody.company_id && reqBody.company_id.length > 0) {
      pipeline.push({
        $match: {
          company_id: ObjectId(reqBody.company_id[0]),
          is_deleted: false
        }
      });
    } else {
      pipeline.push({
        $match: {
          is_deleted: false
        }
      });
    }

    // Handle selected_company_id if present
    if (reqBody.selected_company_id) {
      reqBody.userFilter = true;
      pipeline.push(...queryService(reqBody));
    }

    // Add lookups and processing stages
    pipeline.push(
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
        $lookup: {
          from: 'onboardings',
          localField: '_id',
          foreignField: 'user_id',
          as: 'onboardingDetails'
        }
      },
      {
        $unwind: {
          path: '$onboardingDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'onboardingDetails.assigned_pro',
          foreignField: '_id',
          as: 'assignedProDetails'
        }
      },
      {
        $unwind: {
          path: '$assignedProDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          'onboardingDetails.assignedPro': {
            $concat: [
              { $ifNull: ['$assignedProDetails.first_name', ''] },
              {
                $cond: {
                  if: {
                    $gt: [{ $strLenCP: { $ifNull: ['$assignedProDetails.middle_name', ''] } }, 0]
                  },
                  then: { $concat: [' ', { $ifNull: ['$assignedProDetails.middle_name', ''] }] },
                  else: ' '
                }
              },
              { $ifNull: ['$assignedProDetails.last_name', ''] }
            ]
          },
          'onboardingDetails._id': { $ifNull: ['$onboardingDetails._id', ''] },
          'onboardingDetails.status': { $ifNull: ['$onboardingDetails.status', ''] }
        }
      }
    );

    // Add search condition if present
    if (reqBody.search) {
      const searchRegex = new RegExp(reqBody.search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { first_name: searchRegex },
            { middle_name: searchRegex },
            { last_name: searchRegex },
            { company_name: searchRegex }
          ]
        }
      });
    }

    // Add status filter if present
    if (reqBody.status) {
      if (Array.isArray(reqBody.status)) {
        pipeline.push({ $match: { user_status: { $in: reqBody.status } } });
      } else {
        pipeline.push({ $match: { user_status: reqBody.status } });
      }
    }

    // Add date range filter if present
    if (reqBody.start_date && reqBody.end_date) {
      const endDate = new Date(reqBody.end_date);
      endDate.setDate(endDate.getDate() + 1);
      pipeline.push({
        $match: {
          createdAt: { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) }
        }
      });
    }

    // Add sort stage
    pipeline.push({
      $sort: {
        createdAt: -1
      }
    });

    // Final projection
    pipeline.push({
      $project: {
        _id: 1,
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        user_status: 1,
        company_id: 1,
        image_url: 1,
        employment: 1,
        designation: 1,
        company_name: '$companyDetails.company_name',
        personal: 1,
        insurance: 1,
        emergency: 1,
        emergency_uae: 1,
        bank: 1,
        leaves: 1,
        salary: 1,
        non_wps_salary: 1,
        gratuity: 1,
        dependent_details: 1,
        insurance_agent: 1,
        reporting: 1,
        monthly_costs: 1,
        payroll_details: 1,
        createdAt: 1,
        upfront_costs: '$companyDetails.upfront_costs',
        'onboardingDetails.assignedPro': 1,
        'onboardingDetails.medical_center': {
          $ifNull: ['$onboardingDetails.medical_center', '']
        },
        'onboardingDetails.eid_center': {
          $ifNull: ['$onboardingDetails.eid_center', '']
        },
        'onboardingDetails.tawjeeh_center': {
          $ifNull: ['$onboardingDetails.tawjeeh_center', '']
        },
        'onboardingDetails.eid_center_fingerprint_time': {
          $ifNull: ['$onboardingDetails.eid_center_fingerprint_time', '']
        },
        'onboardingDetails.eid_center_fingerprint_date': {
          $ifNull: ['$onboardingDetails.eid_center_fingerprint_date', '']
        },
        'onboardingDetails._id': 1,
        'onboardingDetails.status': 1
      }
    });

    // Execute pipeline
    let users = await Users.aggregate(pipeline);
    console.log('Users array length:', users?.length);

    // Apply pagination
    let usersResult = pagination(users, page, limit, ['first_name', '_id']);

    if (!users) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Users');
    }

    // Format dates in results
    for (let user of usersResult) {
      if (user.onboardingDetails.eid_center_fingerprint_date && user.onboardingDetails.eid_center_fingerprint_date !== '') {
        user.onboardingDetails.eid_center_fingerprint_date = formatDate(user.onboardingDetails.eid_center_fingerprint_date);
      }
    }

    return usersResult;
  } catch (error) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Could not complete process. An error was encountered with the following details: ' + error
    );
  }
};

const listOfUsersStatus = async (query, reqBody) => {
  const distinctStatuses = await Users.distinct('user_status').exec();
  const statArr = ['active', 'inactive', 'onboarding', 'offboarding', 'visa process', 'new'];
  const combinedArray = [...distinctStatuses, ...statArr];
  const uniqueArray = Array.from(new Set(combinedArray));
  return uniqueArray;
};

// Check Central Login Mail Validation
const userCentralMailValidation = async body => {
  let { email, password, type, otp } = body;
  email = email.toLowerCase().trim();
  const encrypt_email = CryptoJS.AES.encrypt(email, SECRET_KEY).toString();
  const centralBody = {
    email: encrypt_email,
    product_id: process.env.CENTRAL_DB_PRODUCT_ID,
    type: type,
    otp: otp
  };
  const URL = CENTRAL_URL + 'users/centralLogin';

  try {
    const responseCentral = await axios.post(URL, centralBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const product_access = responseCentral.data.data;
    const access = product_access.filter(prod => prod.product_id == process.env.CENTRAL_DB_PRODUCT_ID);
    if (responseCentral.data.success && access.length > 0) {
      return true;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error('An error occurred during central mail validation.');
  }
};

const syncDocs = async () => {
  // let doctypes = await DocumentTypes.find().select({ "type": 1 })
  // let users = await Users.find().select({ 'attachments': 1 })

  // for (let index = 0; index < users.length; index++) {
  //   const element = users[index];
  //   for (let i = 0; i < element.attachments.length; i++) {
  //     const elem = element.attachments[i];
  //     let url = elem.link
  //     let name = elem.filename
  //     let type = elem.documentType.trim().toLowerCase()
  //     let obj = {
  //       "update_logs": [],
  //       "is_deleted": false,
  //       "type": doctypes.filter(a => a.type == type)[0]._id,
  //       "identifier": "users",
  //       "foreign_id": element._id.toString(),
  //       "doc_status": "valid",
  //       "expiry": "",
  //       "module": "users",
  //       "__v": 0,
  //       "name": name,
  //       "url": url,
  //     }
  //     newDocument = new Documents(obj)
  //     const DocCreated = await newDocument.save();
  //   }
  // }
  return 'Success';
};

const ExcelReport = async reqBody => {
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
      $unwind: '$companyDetails'
    },
    {
      $lookup: {
        from: 'visa_processes',
        localField: '_id',
        foreignField: 'user_id',
        as: 'visa_process',
        pipeline: [
          {
            $match: {
              is_deleted: false
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $limit: 1
          },
          {
            $project: {
              status: 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'documents',
        localField: '_id',
        foreignField: 'foreign_id',
        pipeline: [
          {
            $lookup: {
              from: 'document_types',
              localField: 'type',
              foreignField: '_id',
              as: 'DocumentType'
            }
          },
          {
            $unwind: '$DocumentType'
          },
          {
            $project: {
              DocumentType: '$DocumentType.name',
              url: 1
            }
          }
        ],
        as: 'userDocs'
      }
    }

    // {
    //   $unwind : "$DocumentType"
    // }
    // {
    //   $addFields : {
    //      userDocs : {
    //       $filter: {
    //         input: "$Documents",
    //         as: "item",
    //         cond: { $eq: ["$$item.module", "users"] }
    //       }
    //     }
    //   }
    // } ,
    // {
    //   $project : {
    //     "Documents" :  0
    //   }
    // }
  ];
  if (reqBody.company_id) {
    pipeline.unshift(...queryService(reqBody));
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
  if (reqBody.status) {
    if (Array.isArray(reqBody.status)) {
      pipeline.push({ $match: { user_status: { $in: reqBody.status } } });
    } else {
      pipeline.push({ $match: { user_status: reqBody.status } });
    }
  }
  const AllUsers = await Users.aggregate(pipeline);
  return AllUsers;
};

const ExcelReportVisa = async reqBody => {
  let pipeline = [
    {
      $match: {
        is_deleted: false
        // user_status: {$in: ['active', 'onboarding', 'offboarding', 'new visa process', 'withdrawn']},
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
      $unwind: '$companyDetails'
    },
    {
      $lookup: {
        from: 'visa_processes',
        localField: '_id',
        foreignField: 'user_id',
        as: 'visa_process',
        pipeline: [
          {
            $match: {
              is_deleted: false
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $limit: 1
          },
          {
            $project: {
              status: 1,
              assigned_pro: 1
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$visa_process',
        preserveNullAndEmptyArrays: true // In case there's no visa_process for some users
      }
    },
    {
      $lookup: {
        from: 'users', // Assuming the 'users' collection
        localField: 'visa_process.assigned_pro', // Lookup assigned_pro from visa_process
        foreignField: '_id',
        as: 'assignedProDetails'
      }
    },
    {
      $unwind: {
        path: '$assignedProDetails',
        preserveNullAndEmptyArrays: true // In case there's no assigned PRO for some visa_processes
      }
    },
    {
      $lookup: {
        from: 'documents',
        localField: '_id',
        foreignField: 'foreign_id',
        pipeline: [
          {
            $lookup: {
              from: 'document_types',
              localField: 'type',
              foreignField: '_id',
              as: 'DocumentType'
            }
          },
          {
            $unwind: '$DocumentType'
          },
          {
            $project: {
              DocumentType: '$DocumentType.name',
              url: 1,
              expiry: 1,
              document_number: 1
            }
          }
        ],
        as: 'userDocs'
      }
    },
    {
      $lookup: {
        from: 'onboardings',
        localField: '_id',
        foreignField: 'user_id',
        as: 'onboardingDetails'
      }
    },
    {
      $unwind: {
        path: '$onboardingDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users', // Assuming the 'users' collection
        localField: 'onboardingDetails.assigned_escalation_manager', // Lookup assigned_pro from visa_process
        foreignField: '_id',
        as: 'assignedEscalationManagerDetails'
      }
    },
    {
      $unwind: {
        path: '$assignedEscalationManagerDetails',
        preserveNullAndEmptyArrays: true // In case there's no assigned PRO for some visa_processes
      }
    },
    // {
    //   $lookup: {
    //     from: 'users',  // Assuming the 'users' collection
    //     localField: 'onboardingDetails.assigned_insurance_agent',  // Lookup assigned_pro from visa_process
    //     foreignField: '_id',
    //     as: 'assignedInsuranceAgentDetails',
    //   },
    // },
    // {
    //   $unwind: {
    //     path: '$assignedInsuranceAgentDetails',
    //     preserveNullAndEmptyArrays: true,  // In case there's no assigned PRO for some visa_processes
    //   },
    // },
    {
      $lookup: {
        from: 'users', // Assuming the 'users' collection
        localField: 'onboardingDetails.assigned_hr_specialist', // Lookup assigned_pro from visa_process
        foreignField: '_id',
        as: 'assignedHrSpecialistDetails'
      }
    },
    {
      $unwind: {
        path: '$assignedHrSpecialistDetails',
        preserveNullAndEmptyArrays: true // In case there's no assigned PRO for some visa_processes
      }
    },
    {
      $lookup: {
        from: 'users', // Assuming the 'users' collection
        localField: 'onboardingDetails.assigned_support_agent', // Lookup assigned_pro from visa_process
        foreignField: '_id',
        as: 'assignedSupportAgentDetails'
      }
    },
    {
      $unwind: {
        path: '$assignedSupportAgentDetails',
        preserveNullAndEmptyArrays: true // In case there's no assigned PRO for some visa_processes
      }
    },
    {
      $project: {
        first_name: 1,
        middle_name: 1,
        last_name: 1,
        email: 1,
        designation: 1,
        contact_number: 1,
        process_type: 1,
        date_of_joining: 1,
        personal: {
          phone: 1,
          gender: 1,
          address: 1,
          marital_status: 1,
          nationality: 1,
          personal_email: 1,
          personal_mobile: 1,
          uae_local_address: 1,
          other_personal_mobile: 1
        },
        insurance: 1,
        joining_date: '$employment.date_of_joining',
        visaSponsor: '$employment.visa_sponsor_type',
        employmentType: '$employment.employment_type',
        emergency: 1,
        emergency_uae: 1,
        bank: 1,
        reporting: 1,
        manager_name: 1,
        department: 1,
        work_schedule: 1,
        probation_period: 1,
        probation_period_end: 1,
        cost_center: 1,
        onboarding: 1,
        monthly_costs: 1,
        leaves: {
          leave_taken: 1,
          leave_balance: 1,
          leave_encashment: 1
        },
        salary: 1,
        nonwps_salary: 1,
        salary_change_log: 1,
        salary_rotation_required: 1,
        gratuity: 1,
        company_id: 1,
        role_ID: 1,
        user_status: 1,
        payroll_details: 1,
        competencies: 1,
        socials: 1,
        banner_photo: 1,
        covid_details: 1,
        dashboard: 1,
        workAccess: 1,
        image_url: 1,
        firstLogin: 1,
        created_by: 1,
        accessTag: 1,
        updated_by: 1,
        dependent_details: 1,
        place_of_registration: 1,
        unsuccessful_login_attempts: 1,
        last_unsuccessful_login_time: 1,
        payslip_password: 1,
        created_date: 1,
        updated_date: 1,
        onboarding_replace_keys: 1,
        additional_costs: 1,
        backup_reason: 1,
        companyDetails: 1,
        visa_process: '$visa_process',
        assignedPro: {
          full_name: {
            $concat: ['$assignedProDetails.first_name', ' ', '$assignedProDetails.last_name']
          },
          email: '$assignedProDetails.email'
        },
        assigned_escalation_manager: {
          full_name: {
            $concat: ['$assignedEscalationManagerDetails.first_name', ' ', '$assignedEscalationManagerDetails.last_name']
          },
          email: '$assignedEscalationManagerDetails.email'
        },
        assigned_insurance_agent: 1,
        // assigned_insurance_agent: {
        //   full_name: {
        //     $concat: ['$assignedInsuranceAgentDetails.first_name', ' ', '$assignedInsuranceAgentDetails.last_name'],
        //   },
        //   email: '$assignedInsuranceAgentDetails.email',
        // },
        assigned_hr_specialist: {
          full_name: {
            $concat: ['$assignedHrSpecialistDetails.first_name', ' ', '$assignedHrSpecialistDetails.last_name']
          },
          email: '$assignedHrSpecialistDetails.email'
        },
        assigned_support_agent: {
          full_name: {
            $concat: ['$assignedSupportAgentDetails.first_name', ' ', '$assignedSupportAgentDetails.last_name']
          },
          email: '$assignedSupportAgentDetails.email'
        },
        userDocs: {
          $filter: {
            input: '$userDocs',
            as: 'doc',
            cond: {
              $not: {
                $in: [
                  '$$doc.DocumentType',
                  [
                    'Work Order',
                    'MOL Offer Letter',
                    'Accademic Certificate',
                    'Other Documents',
                    'Contract Renewal Agreement',
                    'Letters',
                    'Medical Test Result',
                    'Medical Test Application',
                    'Medical Card Issuance',
                    'Passport Size Photo',
                    'Medical Certificate',
                    'Residency Approval',
                    'Labour Card',
                    'Entry Stamp',
                    'MOL Signed',
                    'Change of Status',
                    'eVisa',
                    'Emirates ID Application',
                    'Health Insurance Application',
                    'Labour Contract',
                    'Insurance',
                    'Cancellation Documents',
                    'signed work Order',
                    'Residence Cancellation',
                    'Tawjeeh Training Completed',
                    'Stamped Residence Visa',
                    'Contract Renewal Signature',
                    'Visa Cancellation',
                    'Employment Contract',
                    'Signed Internal Employment Contract',
                    'Labour cancellation Typing',
                    'Application Form',
                    'Previous Employment Visa',
                    'Invoice',
                    'Stamped E-Visa'
                  ]
                ]
              }
            }
          }
        }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ];

  if (reqBody.company_id) {
    pipeline.unshift(...queryService(reqBody));
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

  if (reqBody.status) {
    if (Array.isArray(reqBody.status)) {
      pipeline.push({ $match: { user_status: { $in: reqBody.status } } });
    } else {
      pipeline.push({ $match: { user_status: reqBody.status } });
    }
  }

  const AllUsers = await Users.aggregate(pipeline);
  const insuranceAgents = await getInsuranceAgents();
  const agentDetails = insuranceAgents.data.find(data => data._id == AllUsers[0].assigned_insurance_agent);
  AllUsers[0].assigned_insurance_agent = agentDetails;
  return AllUsers;
};

const paySlipPasswordChecker = async body => {
  const pipeline = [
    {
      $match: {
        module: 'users',
        type: ObjectId('64254208e92b0c35c0541ce8'),
        foreign_id: ObjectId(body._id)
      }
    },
    {
      $project: {
        document_number: 1
      }
    }
  ];
  const user = await Documents.aggregate(pipeline);

  if (user && user.length > 0) {
    if (user[0].document_number == body.password) {
      return 'success';
    } else {
      return 'Password Does not Match';
    }
  } else {
    return 'Your Passport Details is not with us.';
  }
};

const userDetails = async id => {
  const user = await Users.findOne({ _id: id, is_deleted: false });

  if (!user) {
    return 'User Not Found';
  }
  return user;
};

const updateMissingDetails = async (userId, reqBody, files) => {
  const isUser = await Users.findOne({ is_deleted: false, _id: ObjectId(userId) });

  if (!isUser) throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find User');
  if (reqBody.personal) {
    isUser.personal = { ...isUser.personal, ...reqBody.personal };
    isUser.markModified('personal');
  }

  if (reqBody.emergency) {
    isUser.emergency = { ...isUser.emergency, ...reqBody.emergency };
    isUser.markModified('emergency');
  }

  if (reqBody.emergency_uae) {
    isUser.emergency_uae = { ...isUser.emergency_uae, ...reqBody.emergency_uae };
    isUser.markModified('emergency_uae');
  }

  if (reqBody.phone) {
    isUser.phone = reqBody.phone;
  }

  if (reqBody.other_phone) {
    isUser.other_phone = reqBody.other_phone;
  }
  console.log(isUser);
  // Construct the email body
  const mailBody = `
       <html>
       <head>
         <style>
           /* Email styles */
           body {
             font-family: Arial, sans-serif;
             line-height: 1.6;
             background-color: #f4f4f4;
             padding: 20px;
           }
           .container {
             max-width: 600px;
             margin: 0 auto;
             background: #ffffff;
             border-radius: 8px;
             box-shadow: 0 0 10px rgba(0,0,0,0.1);
             padding: 20px;
           }
           h1 {
             color: #333333;
             font-size: 24px;
             margin-bottom: 20px;
           }
           p {
             color: #555555;
             font-size: 16px;
             margin-bottom: 10px;
           }
           table {
             width: 100%;
             border-collapse: collapse;
             margin-bottom: 20px;
             border: none; /* Remove default table borders */
           }
           th, td {
             padding: 8px;
           }
           th {
             background-color: #f2f2f2;
             text-align: left;
           }
           .table-content td {
             border-bottom: 1px solid #dddddd; /* Add bottom border for each row */
           }
         </style>
       </head>
       <body>
         <div class="container">
           <h1>Profile Update Notification</h1>
           <p>Hello,</p>
           <p>We wanted to inform you that ${isUser.first_name} ${isUser.last_name} has recently updated personal and emergency details on the PEO Central portal.</p>
           <p>To ensure you have the most current and accurate information, please review the updated details at your earliest convenience.</p>

           <table class="table-content">
             <thead>
               <tr>
                 <th colspan="2">Personal Details</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                 <td>Email</td>
                 <td>${isUser.personal.personal_email}</td>
               </tr>
               <tr>
                 <td>Gender</td>
                 <td>${isUser.personal.gender}</td>
               </tr>
               <tr>
                 <td>Address</td>
                 <td>${isUser.personal.address}</td>
               </tr>
               <tr>
                 <td>Marital Status</td>
                 <td>${isUser.personal.marital_status}</td>
               </tr>
             </tbody>
           </table>

           <table class="table-content">
             <thead>
               <tr>
                 <th colspan="2">Contact Details</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                 <td>Phone</td>
                 <td>${isUser.phone}</td>
               </tr>
               <tr>
                 <td>Other Phone</td>
                 <td>${isUser.other_phone}</td>
               </tr>
             </tbody>
           </table>

           <table class="table-content">
             <thead>
               <tr>
                 <th colspan="2">Emergency Contact</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                 <td>Name</td>
                 <td>${isUser.emergency.name}</td>
               </tr>
               <tr>
                 <td>Relationship</td>
                 <td>${isUser.emergency.relationship}</td>
               </tr>
               <tr>
                 <td>Email</td>
                 <td>${isUser.emergency.email}</td>
               </tr>
               <tr>
                 <td>Phone</td>
                 <td>${isUser.emergency.phone}</td>
               </tr>
               <tr>
                 <td>Other Phone</td>
                 <td>${isUser.emergency.other_phone}</td>
               </tr>
             </tbody>
           </table>

           <table class="table-content">
             <thead>
               <tr>
                 <th colspan="2">Emergency Contact (UAE)</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                 <td>Name</td>
                 <td>${isUser.emergency_uae.name}</td>
               </tr>
               <tr>
                 <td>Relationship</td>
                 <td>${isUser.emergency_uae.relationship}</td>
               </tr>
               <tr>
                 <td>Email</td>
                 <td>${isUser.emergency_uae.email}</td>
               </tr>
               <tr>
                 <td>Phone</td>
                 <td>${isUser.emergency_uae.phone}</td>
               </tr>
               <tr>
                 <td>Other Phone</td>
                 <td>${isUser.emergency_uae.other_phone}</td>
               </tr>
             </tbody>
           </table>

           <p style="color: #555555; font-size: 16px; margin-top: 20px; margin-bottom: 20px;">If you have any questions or need further assistance, our support team is here to help. Your prompt attention to this update is greatly appreciated.</p>
           <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Thank you for your continued support.</p>
           <p style="color: #555555; font-size: 16px;">Best regards,<br>PEO Central Team</p>
         </div>
       </body>
       </html>
       `;

  const userToCc = await Users.findOne({ is_deleted: false, email: 'sahiba@nathanhr.com' }).select('email');
  console.log(userToCc.email);
  await isUser.save();
  let emailBody = {
    to: [userToCc.email],
    cc: [], //userToCc
    subject: 'Employee Details Update',
    body: mailBody
  };

  const sendEmail = async (toEmail, subject, body, cc_emails) => {
    try {
      const config = await configuration.findOne({ _id: '6454c46c7a78fea21b3a23fc' }).select({ mailTrap: 1 });
      let ccAddresses = [];
      if (cc_emails != false) {
        ccAddresses = cc_emails;
      }
      console.log(ccAddresses, 'cc email');
      const msg = {
        Source: 'donotreply@nathanhr.ae',
        Destination: {
          ToAddresses: config.mailTrap.trap == true ? config.mailTrap.toEmails : toEmail,
          CcAddresses: config.mailTrap.trap == true ? config.mailTrap.ccEmails : ccAddresses
        },
        Message: {
          Body: {
            Html: {
              Data: body,
              Charset: 'UTF-8'
            },
            Text: {
              Data: body,
              Charset: 'UTF-8'
            }
          },
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          }
        }
      };

      const sendPromise = new Promise((resolve, reject) => {
        ses.sendEmail(msg, async (err, data) => {
          if (err) {
            reject(err);
          } else {
            await new EmailLog({
              from: 'donotreply@nathanhr.ae',
              to: toEmail,
              cc: ccAddresses,
              subject: subject,
              body: body
            }).save();
            resolve(data);
          }
        });
      });

      return sendPromise;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  };
  sendEmail(emailBody.to, emailBody.subject, mailBody, emailBody.cc).then(async result => {
    console.log('follow up Email sent successfully', result);
    // await new EmailLog(req.body).save()
  });
  await Token.deleteMany({ user: userId });
  return isUser;
};

const getAuthenticatedUser = async id => {
  const users = await Users.findOne({ _id: ObjectId(id), is_deleted: false });
  if (users == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find User');
  }
  return users;
};

const tenancyAndResidenceAddressUpdate = async (reqBody, userId) => {
  const isUser = await Users.findOne({ is_deleted: false, _id: ObjectId(userId) });

  if (!isUser) throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find User');

  const { emirate, tenancyResidence, ejari, dewa, address, titleDeed } = reqBody;

  if (emirate) {
    if (emirate === 'Dubai') {
      if (tenancyResidence === 'Yes') {
        // User has valid Tenancy (EJARI) or DEWA
        isUser.personal.address = address;
        if (ejari) {
          isUser.personal.ejari = {
            contractNumber: ejari.contractNumber || '',
            issueDate: ejari.issueDate || '',
            expirationDate: ejari.expirationDate || '',
            attachment: ejari.attachment || '',
            date: new Date()
          };
        }
        if (titleDeed) {
          isUser.personal.titleDeed = {
            titleDeed: titleDeed.titleDeed || '',
            attachment: titleDeed.attachment || '',
            date: new Date()
          };
        }
        if (dewa) {
          isUser.personal.dewa = {
            accountNumber: dewa.accountNumber || '',
            premisesNumber: dewa.premisesNumber || '',
            attachment: dewa.attachment || '',
            date: new Date()
          };
        }
      } else if (tenancyResidence === 'no') {
        // User does not have valid Tenancy or DEWA, direct them to update address
        if (address) {
          isUser.personal.address = address;
        }
      }
    } else if (emirate === 'Outside UAE') {
      console.log('Thanks for your feedback');
    } else {
      // Another emirate is selected, update address
      if (address) {
        isUser.personal.address = address;
      }
    }
    isUser.residencyLastUpdated = new Date();
    // Save the user details with updated information
    updateUser = await Users.findOneAndUpdate({ _id: ObjectId(userId) }, isUser);
    const mailBody = `
      <html>
      <head>
        <style>
          /* Email styles */
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 20px;
          }
          h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            color: #555555;
            font-size: 16px;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: none; /* Remove default table borders */
          }
          th, td {
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
            text-align: left;
          }
          .table-content td {
            border-bottom: 1px solid #dddddd; /* Add bottom border for each row */
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Profile Update Notification</h1>
          <p>Hello,</p>
          <p>We wanted to inform you that ${isUser.first_name} ${
      isUser.last_name
    } has recently updated Tenancy and Residence details on the PEO Central portal.</p>
          <p>To ensure you have the most current and accurate information, please review the updated details at your earliest convenience.</p>

          <table class="table-content">
            <thead>
              <tr>
                <th colspan="2">Personal Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Address</td>
                <td>${isUser.personal.address}</td>
              </tr>

            </tbody>
          </table>

          <table class="table-content">
            <thead>
              <tr>
                <th colspan="2">Updated Details</th>
              </tr>
            </thead>
            <tbody>
              <!-- EJARI Details -->
              <tr>
                <td colspan="2"><strong>EJARI Details</strong></td>
              </tr>
              <tr>
                <td>Contract Number</td>
                <td>${isUser.personal.ejari ? isUser.personal.ejari.contractNumber : 'N/A'}</td>
              </tr>
              <tr>
                <td>Issue Date</td>
                <td>${isUser.personal.ejari ? isUser.personal.ejari.issueDate : 'N/A'}</td>
              </tr>
              <tr>
                <td>Expiration Date</td>
                <td>${isUser.personal.ejari ? isUser.personal.ejari.expirationDate : 'N/A'}</td>
              </tr>
              <tr>
                <td>Attachment</td>
                <td>${
                  isUser.personal.ejari && isUser.personal.ejari.attachment
                    ? `<a href="${isUser.personal.ejari.attachment}" target="_blank">View Attachment</a>`
                    : 'N/A'
                }</td>
              </tr>

              <!-- DEWA Details -->
              <tr>
                <td colspan="2"><strong>DEWA Details</strong></td>
              </tr>
              <tr>
                <td>Account Number</td>
                <td>${isUser.personal.dewa ? isUser.personal.dewa.accountNumber : 'N/A'}</td>
              </tr>
              <tr>
                <td>Premises Number</td>
                <td>${isUser.personal.dewa ? isUser.personal.dewa.premisesNumber : 'N/A'}</td>
              </tr>
              <tr>
                <td>Attachment</td>
                <td>${
                  isUser.personal.dewa && isUser.personal.dewa.attachment
                    ? `<a href="${isUser.personal.dewa.attachment}" target="_blank">View Attachment</a>`
                    : 'N/A'
                }</td>
              </tr>
               <tr>
                <td colspan="2"><strong>Title Deed Details</strong></td>
              </tr>
              <tr>
                <td>Title Deed</td>
                <td>${isUser.personal.titleDeed ? isUser.personal.titleDeed.titleDeed : 'N/A'}</td>
              </tr>
               <tr>
                <td>Attachment</td>
                <td>${
                  isUser.personal.titleDeed && isUser.personal.titleDeed.attachment
                    ? `<a href="${isUser.personal.titleDeed.attachment}" target="_blank">View Attachment</a>`
                    : 'N/A'
                }</td>
              </tr>
              <!-- Address Details -->
              <tr>
                <td colspan="2"><strong>Address Details</strong></td>
              </tr>
              <tr>
                <td>Address</td>
                <td>${isUser.personal && isUser.personal.address ? isUser.personal.address : 'N/A'}</td>
              </tr>
            </tbody>
          </table>

          <p style="color: #555555; font-size: 16px; margin-top: 20px; margin-bottom: 20px;">If you have any questions or need further assistance, our support team is here to help. Your prompt attention to this update is greatly appreciated.</p>
          <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Thank you for your continued support.</p>
          <p style="color: #555555; font-size: 16px;">Best regards,<br>PEO Central Team</p>
        </div>
      </body>
      </html>
      `;
    let emailBody = {
      to: ['sahiba@nathanhr.com'],
      cc: ['sehrish@nathanhr.com'], //userToCc
      subject: 'Employee Details Update',
      body: mailBody
    };

    const sendEmail = async (toEmail, subject, body, cc_emails) => {
      try {
        const config = await configuration.findOne({ _id: '6454c46c7a78fea21b3a23fc' }).select({ mailTrap: 1 });
        let ccAddresses = [];
        if (cc_emails != false) {
          ccAddresses = cc_emails;
        }
        console.log(ccAddresses, 'cc email');
        const msg = {
          Source: 'donotreply@nathanhr.ae',
          Destination: {
            ToAddresses: config.mailTrap.trap == true ? config.mailTrap.toEmails : toEmail,
            CcAddresses: config.mailTrap.trap == true ? config.mailTrap.ccEmails : ccAddresses
          },
          Message: {
            Body: {
              Html: {
                Data: body,
                Charset: 'UTF-8'
              },
              Text: {
                Data: body,
                Charset: 'UTF-8'
              }
            },
            Subject: {
              Data: subject,
              Charset: 'UTF-8'
            }
          }
        };

        const sendPromise = new Promise((resolve, reject) => {
          ses.sendEmail(msg, async (err, data) => {
            if (err) {
              reject(err);
            } else {
              await new EmailLog({
                from: 'donotreply@nathanhr.ae',
                to: toEmail,
                cc: ccAddresses,
                subject: subject,
                body: body
              }).save();
              resolve(data);
            }
          });
        });

        return sendPromise;
      } catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
    };
    sendEmail(emailBody.to, emailBody.subject, mailBody, emailBody.cc).then(async result => {
      console.log('follow up Email sent successfully', result);
      // await new EmailLog(req.body).save()
    });
    await Token.deleteMany({ user: userId });
    return isUser;
  } else {
    return isUser;
  }
};

const exportTenancyAndResidenceAddressUpdateData = async reqQuery => {
  const excelJs = require('exceljs');
  const moment = require('moment');
  const workbook = new excelJs.Workbook();
  workbook.creator = 'PEO Central';
  workbook.created = new Date();

  try {
    // Parse date range from reqQuery or use default values
    const startDate = reqQuery.startDate
      ? new Date(reqQuery.startDate)
      : new Date(moment().subtract(1, 'months').format('YYYY-MM-DD'));

    const endDate = reqQuery.endDate ? new Date(reqQuery.endDate) : new Date(moment().format('YYYY-MM-DD'));

    // Set endDate to end of day
    endDate.setHours(23, 59, 59, 999);

    // Create pipeline for aggregation
    const pipeline = [
      {
        $match: {
          is_deleted: false,
          $or: [
            { 'personal.ejari': { $exists: true, $ne: null } },
            { 'personal.titleDeed': { $exists: true, $ne: null } },
            { 'personal.dewa': { $exists: true, $ne: null } }
          ],
          residencyLastUpdated: {
            $gte: startDate,
            $lte: endDate
          }
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
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          first_name: 1,
          middle_name: 1,
          last_name: 1,
          email: 1,
          company_name: '$companyDetails.company_name',
          address: '$personal.address',
          ejari: '$personal.ejari',
          dewa: '$personal.dewa',
          titleDeed: '$personal.titleDeed',
          residencyLastUpdated: 1
        }
      },
      {
        $sort: { residencyLastUpdated: -1 }
      }
    ];

    const users = await Users.aggregate(pipeline);

    // Create worksheet for the export
    const sheet = workbook.addWorksheet('Tenancy & Residence Data', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Define columns for the Excel file
    const columns = [
      { header: 'First Name', key: 'first_name', width: 20 },
      { header: 'Middle Name', key: 'middle_name', width: 20 },
      { header: 'Last Name', key: 'last_name', width: 20 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Company', key: 'company_name', width: 30 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'EJARI Contract Number', key: 'ejari_contract_number', width: 25 },
      { header: 'EJARI Issue Date', key: 'ejari_issue_date', width: 20 },
      { header: 'EJARI Expiration Date', key: 'ejari_expiration_date', width: 25 },
      { header: 'EJARI Attachment', key: 'ejari_attachment', width: 40 },
      { header: 'Title Deed', key: 'title_deed', width: 30 },
      { header: 'Title Deed Attachment', key: 'title_deed_attachment', width: 40 },
      { header: 'DEWA Account Number', key: 'dewa_account_number', width: 25 },
      { header: 'DEWA Premises Number', key: 'dewa_premises_number', width: 25 },
      { header: 'DEWA Attachment', key: 'dewa_attachment', width: 40 },
      { header: 'Last Updated', key: 'last_updated', width: 20 }
    ];

    // Add title
    const dateRangeText = `${moment(startDate).format('DD MMM YYYY')} - ${moment(endDate).format('DD MMM YYYY')}`;
    const title = `Tenancy and Residence Address Update Data (${dateRangeText})`;
    sheet.addRow([title]);
    sheet.getRow(1).font = { bold: true, size: 16 };
    sheet.getRow(1).alignment = { horizontal: 'center' };
    sheet.mergeCells(1, 1, 1, columns.length);

    // Add column headers (row 2)
    sheet.addRow(columns.map(col => col.header));
    const headerRow = sheet.getRow(2);
    headerRow.height = 28;
    headerRow.eachCell((cell, colNumber) => {
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

    // Set column widths
    columns.forEach((col, i) => {
      sheet.getColumn(i + 1).width = col.width;
    });

    // Add data to worksheet
    let rowNum = 3;
    for (const user of users) {
      const rowData = {
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        company_name: user.company_name || '',
        address: user.address || '',
        ejari_contract_number: user.ejari ? user.ejari.contractNumber || '' : '',
        ejari_issue_date: user.ejari ? formatDate(user.ejari.issueDate) : '',
        ejari_expiration_date: user.ejari ? formatDate(user.ejari.expirationDate) : '',
        ejari_attachment: user.ejari ? user.ejari.attachment || '' : '',
        title_deed: user.titleDeed ? user.titleDeed.titleDeed || '' : '',
        title_deed_attachment: user.titleDeed ? user.titleDeed.attachment || '' : '',
        dewa_account_number: user.dewa ? user.dewa.accountNumber || '' : '',
        dewa_premises_number: user.dewa ? user.dewa.premisesNumber || '' : '',
        dewa_attachment: user.dewa ? user.dewa.attachment || '' : '',
        last_updated: formatDate(user.residencyLastUpdated)
      };

      const row = sheet.addRow(Object.values(rowData));

      // Style row
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', wrapText: true };

        // Add hyperlinks for attachments
        const colKey = columns[colNumber - 1].key;
        if (['ejari_attachment', 'title_deed_attachment', 'dewa_attachment'].includes(colKey) && cell.value) {
          cell.value = {
            text: 'View Attachment',
            hyperlink: cell.value,
            tooltip: 'Click to view attachment'
          };
          cell.font = {
            color: { argb: '0000FF' },
            underline: true
          };
          cell.alignment = { horizontal: 'center' };
        }
      });

      rowNum++;
    }

    // Add conditional formatting (alternate row colors)
    for (let i = 3; i < rowNum; i++) {
      if (i % 2 === 0) {
        sheet.getRow(i).eachCell({ includeEmpty: true }, cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' }
          };
        });
      }
    }

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    console.error('Error generating tenancy and residence address export:', error);
    throw new Error(`Failed to generate Excel export: ${error.message}`);
  }
};
const geSystemProList = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const total = await Users.countDocuments({ is_deleted: false, 'employment.designation': 'PRO' });
    const proList = await Users.find({ is_deleted: false, 'employment.designation': 'PRO' })
      .select({ first_name: 1, last_name: 1, email: 1, user_status: 1, is_deleted: 1 })
      .skip(skip)
      .limit(limit);
    if (!proList) throw new Error('Could not list system PRO list');
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      totalPages,
      currentPage: page,
      proList
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getPros = async reqQuery => {
  try {
    const searchRegex = new RegExp(reqQuery.search, 'i');
    const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 50;
    const skip = (page - 1) * limit;

    const filter = {
      is_deleted: false,
      'employment.designation': 'PRO',
      $or: [
        { first_name: { $regex: searchRegex } },
        { last_name: { $regex: searchRegex } },
        { middle_name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ]
    };
    const options = {
      skip,
      page,
      limit
    };
    const pros = await Users.paginate(filter, options);
    const internalStaff = await Users.find({ is_internal_staff: true, is_deleted: false });
    const existingIds = new Set(pros.results.map(user => user._id.toString()));

    // Filter out internal staff who are already in pros
    const uniqueInternalStaff = internalStaff.filter(user => !existingIds.has(user._id.toString()));

    // Combine the arrays
    const combinedResults = [...pros.results, ...uniqueInternalStaff];

    return combinedResults;
  } catch (error) {
    throw new Error(error);
  }
};

const fetchSupportHrEscalationRoles = async (role, options = {}) => {
  try {
    const { sortBy = 'createdAt:desc', limit = 10, page = 1, populate = '' } = options;

    let filter = { is_deleted: false };
    if (role.toLowerCase() == 'pro') {
      console.log('role is pro');
      filter['employment.designation'] = 'PRO';

      const result = await Users.find(filter).select({ first_name: 1, last_name: 1, _id: 1 });

      return result;
    }

    // If role is not "all", set a specific filter for the role
    if (role.toLowerCase() !== 'all') {
      switch (role.toLowerCase()) {
        case 'hr specialists':
          filter.has_hr_specialist_role = true;
          break;
        case 'support agents':
          filter.has_support_agent_role = true;
          break;
        case 'escalation managers':
          filter.has_escalation_manager_role = true;
          break;
        case 'insurance agents':
          filter.has_insurance_agent_role = true;
          break;
        default:
          return []; // Return an empty array if the role doesn't match any case
      }

      // Fetch data for the specific role and return it
      const result = await Users.find(filter)
        .sort(sortBy)
        .limit(limit)
        .skip((page - 1) * limit)
        .select({ first_name: 1, last_name: 1, _id: 1 });

      return result;
    }

    // If role is "all", fetch each role separately and structure results in an object
    const roles = {
      hrSpecialists: [],
      supportAgents: [],
      escalationManagers: [],
      insuranceAgents: [],
      PROs: []
    };

    // Fetch for each role separately and populate the roles object
    const hrSpecialists = await Users.find({ ...filter, has_hr_specialist_role: true })
      .sort(sortBy)
      .limit(limit)
      .skip((page - 1) * limit)
      .select({ first_name: 1, last_name: 1, _id: 1 });

    const supportAgents = await Users.find({ ...filter, has_support_agent_role: true })
      .sort(sortBy)
      .limit(limit)
      .skip((page - 1) * limit)
      .select({ first_name: 1, last_name: 1, _id: 1 });

    const escalationManagers = await Users.find({ ...filter, has_escalation_manager_role: true })
      .sort(sortBy)
      .limit(limit)
      .skip((page - 1) * limit)
      .select({ first_name: 1, last_name: 1, _id: 1 });

    const insuranceAgents = await Users.find({ ...filter, has_insurance_agent_role: true })
      .sort(sortBy)
      .limit(limit)
      .skip((page - 1) * limit)
      .select({ first_name: 1, last_name: 1, _id: 1 });

    const systemPROs = await Users.find({ ...filter, 'employment.designation': 'PRO' })
      .sort(sortBy)
      .limit(limit)
      .skip((page - 1) * limit)
      .select({ first_name: 1, last_name: 1, _id: 1 });

    // Assign results to roles object
    roles.hrSpecialists = hrSpecialists;
    roles.supportAgents = supportAgents;
    roles.escalationManagers = escalationManagers;
    roles.insuranceAgents = insuranceAgents;
    roles.PROs = systemPROs;

    return roles;
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
};

const calculateTotalFixed = salary => {
  if (!salary || typeof salary !== 'object') return 0;

  const validKeys = [
    'basic_salary',
    'housing_allowance',
    'hra_allowance',
    'other_allowance',
    'food_allowance',
    'transportation_allowance',
    'car_allowance',
    'petrol_allowance'
  ];

  let totalFixed = 0;

  validKeys.forEach(key => {
    const value = parseFloat(salary[key]); // Use parseFloat instead of Number
    console.log(`Calculating for ${key}: ${value}`); // Log value for each field
    if (!isNaN(value)) {
      totalFixed += value;
    }
  });

  console.log(`Total fixed calculated: ${totalFixed}`); // Log the final total
  return totalFixed;
};

const updateSalary = async () => {
  try {
    const users = await Users.find({
      is_deleted: false,
      // _id:ObjectId('65a679997a3a36a4388993eb'),
      user_status: { $in: ['active', 'onboarding', 'offboarding', 'new visa process'] }
    });
    console.log(`Found ${users.length} users`); // Log the number of users found

    for (const user of users) {
      console.log('Updating user:', user.first_name);
      const { salary } = user;
      console.log('Current salary:', salary); // Log the entire salary object
      const totalFixed = calculateTotalFixed(salary);

      console.log(`Calculated total_fixed: ${totalFixed}`); // Log the calculated total

      const result = await Users.updateOne({ _id: user._id }, { $set: { 'salary.total_fixed': totalFixed } });

      console.log(`Update result: ${result.nModified} document(s) modified`); // Log update result
    }

    console.log('Successfully updated total_fixed for all users.');
    return await Users.findOne({ _id: ObjectId('6729d66cce1806aafafad7d1') }).select('salary first_name last_name email');
  } catch (error) {
    console.error('Error updating total_fixed:', error);
  }
};

const generateUniqueReferenceNumbers = async () => {
  try {
    const employees = await Users.find({ is_deleted: false }).populate('company_id');
    const companyMap = new Map();

    for (const employee of employees) {
      if (!employee.reference_number) {
        let companyCode = '';

        console.log('Processing employee:', employee.first_name);

        if (employee.company_id) {
          if (companyMap.has(employee.company_id._id)) {
            companyCode = companyMap.get(employee.company_id._id);
            console.log('Found in cache:', companyCode);
          } else {
            if (employee.company_id.company_name) {
              companyCode = generateCompanyCode(employee.company_id.company_name);
              companyMap.set(employee.company_id._id, companyCode);
              console.log('Using company name:', employee.company_id.company_name);
            } else {
              const company = await Companies.findById(employee.company_id._id);
              console.log('Fetched company:', company?.company_name);
              if (company?.company_name) {
                companyCode = generateCompanyCode(company.company_name);
                companyMap.set(employee.company_id._id, companyCode);
              }
            }
          }
        }

        if (!companyCode) {
          console.log('No company name found for', employee.first_name, 'using GEN');
          companyCode = 'GEN';
        }

        // Escape special characters in the company code for regex
        const escapedCompanyCode = escapeRegex(companyCode);

        // Generate a unique reference number
        let uniqueString = `PEO-${escapedCompanyCode}`;
        const count = await Users.countDocuments({ reference_number: new RegExp(`^${uniqueString}`) });
        uniqueString += `-${String(count + 1).padStart(4, '0')}`;

        console.log(`Final reference for ${employee.first_name}:`, uniqueString);

        await Users.updateOne({ _id: employee._id }, { $set: { reference_number: uniqueString } });
      }
    }
  } catch (error) {
    console.error('Error details:', error);
    throw new Error(`Failed to generate reference numbers: ${error.message}`);
  }
};

/**
 * ===================================================================================================================
 * Function to generate unique reference numbers for all employees
 * This is needed for finance on the billings section
 * The implementation users a combination of random numbers generated incrementally;
 * Alongside company names tto generate these numbers
 * ===================================================================================================================
 */
// Function to generate company code based on name
const generateCompanyCode = companyName => {
  const words = companyName.split(' ').filter(Boolean);
  if (words.length === 1) {
    return words[0].toUpperCase();
  }

  const firstWord = words[0].toUpperCase();
  const initials = words
    .slice(1)
    .map(word => word[0].toUpperCase())
    .join('');

  // Combine and remove special characters like parentheses
  return `${firstWord}/${initials.replace(/[^\w]/g, '')}`;
};

const mobileStats = async reqQuery => {
  console.log('mobile stats');
  try {
    // Initialize the base pipeline (same as before)
    const pipeline = [
      {
        $match: {
          user_status: { $in: ['active', 'onboarding', 'offboarding', 'new visa process'] },
          is_deleted: false,
          hasMobileLoggedIn: true
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
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          fullName: {
            $concat: [
              { $ifNull: ['$first_name', ''] },
              ' ',
              { $ifNull: ['$middle_name', ''] },
              ' ',
              { $ifNull: ['$last_name', ''] }
            ]
          },
          firstMobileLoginDate: 1, // Keep the date field
          companyName: { $ifNull: ['$companyDetails.company_name', 'N/A'] },
          companyId: '$companyDetails._id',
          image_url: {
            $ifNull: [
              '$image_url',
              'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1753350626269_user.jpg/user.jpg'
            ]
          }
        }
      }
    ];

    // Count the total number of users and fetch users (same as before)
    const countPipeline = [...pipeline, { $count: 'mobileLoggedInUsers' }];
    const countResponse = await Users.aggregate(countPipeline);
    const count = countResponse.length > 0 ? countResponse[0].mobileLoggedInUsers : 0;

    const userPipeline = [...pipeline];
    const users = await Users.aggregate(userPipeline);

    // Format the firstMobileLoginDate for each user
    const formattedUsers = users.map(user => {
      return {
        ...user,
        firstMobileLoginDate: user.firstMobileLoginDate // Format the date here
      };
    });

    // Company count pipeline (same as before)
    const companyCountPipeline = [
      {
        $match: {
          user_status: { $in: ['active', 'onboarding', 'offboarding', 'new visa process'] },
          is_deleted: false,
          hasMobileLoggedIn: true
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'companyDetails'
        }
      },
      {
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$companyDetails._id',
          companyName: { $first: '$companyDetails.company_name' },
          companyCount: { $sum: 1 }
        }
      },
      {
        $project: {
          companyName: 1,
          companyCount: 1
        }
      }
    ];

    const companyCountResponse = await Users.aggregate(companyCountPipeline);

    const companies = companyCountResponse.length > 0 ? companyCountResponse : [{ companyName: 'N/A', companyCount: 0 }];

    return { count, users: formattedUsers, companies };
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

// Format date function
function formatDate(val) {
  return val ? moment(val).format('DD-MMM-YYYY') : '';
}

/**
 * implementation to export data for bulk upload
 */
const exportDataForBulkUpload = async () => {
  try {
    const pipeline = [
      {
        $match: {
          user_status: { $in: ['active', 'onboarding', 'new visa process'] }
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
        $unwind: {
          path: '$companyDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'documents',
          let: { user_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$foreign_id', '$$user_id'] },
                    {
                      $in: [
                        '$type',
                        [
                          ObjectId('64254208e92b0c35c0541ce8'), // Passport
                          ObjectId('6412c9795d3c723a3cf939d6') // Labor Card
                        ]
                      ]
                    }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'document_types',
                localField: 'type',
                foreignField: '_id',
                as: 'documentTypeDetails'
              }
            },
            {
              $unwind: {
                path: '$documentTypeDetails',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                documentName: '$documentTypeDetails.name',
                document_number: 1,
                expiry: 1,
                url: 1,
                type: 1
              }
            }
          ],
          as: 'allDocuments'
        }
      },
      {
        $project: {
          company_name: '$companyDetails.company_name',
          employeeName: {
            $concat: [
              '$first_name',
              ' ',
              { $ifNull: ['$middle_name', ''] },
              { $cond: { if: { $ne: ['$middle_name', null] }, then: ' ', else: '' } },
              '$last_name'
            ]
          },
          email: 1,
          nationality: '$personal.nationality',
          date_of_birth: '$personal.dob',
          date_of_joining: 1,
          phone: '$personal.phone',
          marital_status: '$personal.marital_status',
          gender: '$personal.gender',
          internal_designation: '$employment.designation',
          visa_designation: '$employment.visa_designation',
          passport_number: {
            $let: {
              vars: {
                passport: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$allDocuments',
                        as: 'doc',
                        cond: { $eq: ['$$doc.type', ObjectId('64254208e92b0c35c0541ce8')] }
                      }
                    },
                    0
                  ]
                }
              },
              in: '$$passport.document_number'
            }
          },
          passport_expiry: {
            $let: {
              vars: {
                passport: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$allDocuments',
                        as: 'doc',
                        cond: { $eq: ['$$doc.type', ObjectId('64254208e92b0c35c0541ce8')] }
                      }
                    },
                    0
                  ]
                }
              },
              in: '$$passport.expiry'
            }
          },
          passport_url: {
            $let: {
              vars: {
                passport: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$allDocuments',
                        as: 'doc',
                        cond: { $eq: ['$$doc.type', ObjectId('64254208e92b0c35c0541ce8')] }
                      }
                    },
                    0
                  ]
                }
              },
              in: '$$passport.url'
            }
          },
          labour_card_url: {
            $let: {
              vars: {
                laborCard: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$allDocuments',
                        as: 'doc',
                        cond: { $eq: ['$$doc.type', ObjectId('6412c9795d3c723a3cf939d6')] }
                      }
                    },
                    0
                  ]
                }
              },
              in: '$$laborCard.url'
            }
          },
          labour_card_number: {
            $let: {
              vars: {
                laborCard: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$allDocuments',
                        as: 'doc',
                        cond: { $eq: ['$$doc.type', ObjectId('6412c9795d3c723a3cf939d6')] }
                      }
                    },
                    0
                  ]
                }
              },
              in: '$$laborCard.document_number'
            }
          },
          labour_card_number_expiry: {
            $let: {
              vars: {
                laborCard: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$allDocuments',
                        as: 'doc',
                        cond: { $eq: ['$$doc.type', ObjectId('6412c9795d3c723a3cf939d6')] }
                      }
                    },
                    0
                  ]
                }
              },
              in: '$$laborCard.expiry'
            }
          }
        }
      }
    ];

    const users = await Users.aggregate(pipeline);

    const workbook = new excelJs.Workbook();
    const sheet = workbook.addWorksheet('Users');
    sheet.columns = [
      { header: 'Company Name', key: 'company_name', width: 55 },
      { header: 'Employee Name', key: 'employeeName', width: 45 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Nationality', key: 'nationality', width: 20 },
      { header: 'Date of Birth', key: 'date_of_birth', width: 20 },
      { header: 'Date of Joining', key: 'date_of_joining', width: 20 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Marital Status', key: 'marital_status', width: 20 },
      { header: 'Gender', key: 'gender', width: 15 },
      { header: 'Internal Designation', key: 'internal_designation', width: 40 },
      { header: 'Visa Designation', key: 'visa_designation', width: 28 },
      { header: 'Passport Number', key: 'passport_number', width: 40 },
      { header: 'Passport Expiry', key: 'passport_expiry', width: 20 },
      { header: 'Passport', key: 'passport', width: 45 },
      { header: 'Labour Card Number', key: 'labour_card_number', width: 40 },
      { header: 'Labour Card Number Expiry', key: 'labour_card_number_expiry', width: 35 },
      { header: 'Labour Card', key: 'labour_card', width: 200 }
    ];

    // Styling for header row
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0070C0' }
      };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Adding data rows with hyperlinks and border styling
    users.forEach(user => {
      const row = sheet.addRow({
        company_name: user.company_name,
        employeeName: user.employeeName,
        email: user.email,
        nationality: user.nationality,
        date_of_birth: user.date_of_birth,
        date_of_joining: user.date_of_joining,
        phone: user.phone,
        marital_status: user.marital_status,
        gender: user.gender,
        internal_designation: user.internal_designation,
        visa_designation: user.visa_designation,
        passport_number: user.passport_number,
        passport_expiry: user.passport_expiry,
        passport: {
          text: user.passport_url || 'View Passport',
          hyperlink: user.passport_url
        },
        labour_card_number: user.labour_card_number,
        labour_card_number_expiry: user.labour_card_number_expiry,
        labour_card: {
          text: user.labour_card_url || 'View Labour Card',
          hyperlink: user.labour_card_url
        }
      });

      // Apply border styling to all cells
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllSupportAgents = async () => {
  try {
    const supportAgents = await Users.find({ 'reporting.isSupport': true });
    return supportAgents;
  } catch (error) {
    throw new Error(error);
  }
};

const userStatusDistribution = async reqBody => {
  try {
    const pipeline = [
      {
        $match: {
          is_deleted: false
        }
      },
      {
        $group: {
          _id: '$user_status',
          count: { $sum: 1 }
        }
      }
    ];
    if (reqBody.selected_company_id) {
      pipeline.unshift(...queryService(reqBody));
    }
    console.log('here is the pipeline', pipeline);
    const response = await Users.aggregate(pipeline);
    return response; // Return the aggregated result
  } catch (error) {
    throw new Error(error.message || 'An error occurred during user status distribution');
  }
};

/**
 * Get statistics related to tenancy and residence data updates
 * @param {Object} reqQuery - Query parameters for filtering stats
 * @returns {Object} Statistics object with counts for different categories
 */
const getTenancyAndResidenceStats = async reqQuery => {
  const { startDate, endDate } = reqQuery;

  const now = new Date();
  const currentYear = now.getFullYear();

  // Default start and end date
  const startDateFilter = startDate ? new Date(startDate) : new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const endDateFilter = endDate ? new Date(endDate) : new Date(`${currentYear}-12-31T23:59:59.999Z`);

  if (endDate) {
    endDateFilter.setHours(23, 59, 59, 999);
  }

  try {
    const matchQuery = {
      residencyLastUpdated: {
        $gte: startDateFilter,
        $lte: endDateFilter
      }
    };

    // Updated field paths to match what tenancyAndResidenceAddressUpdate actually sets
    const totalEjari = await Users.countDocuments({
      ...matchQuery,
      'personal.ejari.contractNumber': { $exists: true, $ne: '' }
    });

    const totalTitleDeeds = await Users.countDocuments({
      ...matchQuery,
      'personal.titleDeed.titleDeed': { $exists: true, $ne: '' }
    });

    const totalDewa = await Users.countDocuments({
      ...matchQuery,
      'personal.dewa.accountNumber': { $exists: true, $ne: '' }
    });

    const totalDubaiResidence = await Users.countDocuments({
      ...matchQuery,
      'personal.address': /dubai/i // Case-insensitive match for "Dubai" in address string
    });

    const totalOutsideUAE = await Users.countDocuments({
      ...matchQuery,
      'personal.address': /outside uae/i // If you want to identify this by address text
    });

    const totalUpdates = await Users.countDocuments(matchQuery);

    return {
      totalEjari,
      totalTitleDeeds,
      totalDewa,
      totalDubaiResidence,
      totalOutsideUAE,
      totalUpdates,
      dateRange: {
        start: startDateFilter.toISOString().split('T')[0],
        end: endDateFilter.toISOString().split('T')[0]
      }
    };
  } catch (error) {
    console.error('Error fetching tenancy and residence stats:', error);
    throw new Error('Failed to fetch statistics data');
  }
};

module.exports = {
  userStatusDistribution,
  mobileStats,
  userLoginAzure,
  ExcelReportVisa,
  createUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  updateUserOnId,
  deleteUserOnId,
  userLogin,
  updateUpdatedBy,
  updateCreatedBy,
  userDetailsForEmpListingPage,
  userDetailsForEmpPageOnId,
  countsOfDifferentUsers,
  dynamicSearch,
  usersOnStatus,
  usersOnCompanyID,
  getUsersBetweenDatesAndStatus,
  allUsersNameCompanyImg,
  listAllUsersDropDown,
  usersOnCompanyIdListing,
  userListingSearchingFilteringAndPagination,
  listOfUsersStatus,
  userCentralLogin,
  userCentralValidation,
  countsOfDifferentUsersOnCompanyID,
  listAllUsersIdAndSalary,
  userCentralMailValidation,
  listOfAdminUsers,
  syncDocs,
  getLogin,
  ExcelReport,
  getAllPro,
  paySlipPasswordChecker,
  userDetails,
  // refreshTokens
  getNonEmployees,
  updateMissingDetails,
  getAuthenticatedUser,
  addAdditionalCostsToUserOnId,
  tenancyAndResidenceAddressUpdate,
  geSystemProList,
  fetchSupportHrEscalationRoles,
  updateSalary,
  mobileLogin,
  generateUniqueReferenceNumbers,
  exportDataForBulkUpload,
  ClientLoginFlow,
  getAllSupportAgents,
  fetchEmployeesByCompanyIdAndEmployment,
  exportTenancyAndResidenceAddressUpdateData,
  getTenancyAndResidenceStats,
  updateInternalStaff,
  createInternalStaff,
  fetchInternalEmployees
};
