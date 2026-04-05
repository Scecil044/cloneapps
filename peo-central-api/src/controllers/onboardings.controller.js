const httpStatus = require('http-status');
const { onboardingService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require('../services');
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { Processes, Companies } = require('../models');
const { loggerService } = require('../services');
const { documentTemplateService } = require('../services');
const { documentTemplateCloneService } = require('../services');
const { DocumentTemplatesClone, EmailTemplateClone } = require('../models');
const { processesService, usersService, tokenService, emailTemplateService } = require('../services');
const { sendRawEmail } = require('../middlewares/email');
const { tokenTypes } = require('../config/tokens');
const config = require('../config/config');
const axios = require('axios');

const createOnboardings = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.createOnboardings(req.body);
    const created_by = await onboardingService.updateCreatedBy(onboardings._id, req.userId);
    const logMessage = logOnboardingsCreation(req.userId, onboardings);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      onboardings._id,
      'onboardings',
      {},
      onboardings,
      {},
      logMessage
    );
    const logString = logger.info(`${req.userName} Created a Onboardings with ID ${onboardings._id}`).transports[0]
      .logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.CREATED).send(onboardings);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Create Onboardings, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Onboarding. Please Check the Input', details: error });
  }
});

function logOnboardingsCreation(userId, onboardings) {
  const logMsg = `User ${userId} Created Onboarding ${onboardings._id}`;
  return logMsg;
}

const updateOnboardingsOnId = catchAsync(async (req, res) => {
  try {
    const existingOnboardingsbyID = await onboardingService.onboardingsById(req.params.onboardingsId);
    const updatedOnboardings = await onboardingService.updateOnboardingsOnId(req.params.onboardingsId, req.body);
    const updatedBy = await onboardingService.updateUpdatedBy(req.params.onboardingsId, req.userId);
    const updatedFields = diff(existingOnboardingsbyID.toJSON(), updatedOnboardings.toJSON());
    const logMessage = logOnboardingsUpdates(req.userId, existingOnboardingsbyID, updatedOnboardings, updatedFields);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.onboardingsId,
      'onboardings',
      existingOnboardingsbyID,
      updatedOnboardings,
      updatedFields,
      logMessage
    );
    if (!updatedOnboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Onboarding');
    }
    const logString = logger.info(`${req.userName} Updated Onboardings with ID ${req.params.onboardingsId}`).transports[0]
      .logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(updatedOnboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Onboardings with ID ${req.params.onboardingsId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to update Onboarding. Please Check the Input', details: error });
  }
});

function logOnboardingsUpdates(userId, oldDoc, updatedOnboardings, updatedFields) {
  const logMsg = `User ${userId} updated Onboarding ${updatedOnboardings._id}\nFields:`;
  const fieldUpdates = [];
  for (const field in updatedFields) {
    fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedOnboardings[field]}`);
  }
  return `${logMsg}\n${fieldUpdates.join('\n')}`;
}

const listAllOnboardings = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.listAllOnboardings();
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Onboardings');
    }
    const logString = logger.info(`${req.userName} Accessed all the Onboarding Data`).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Onboardings, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the Onboardings', details: error });
  }
});

const getOnboardings = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const onboardings = await onboardingService.getOnboardings(req.query.companyId, page, limit);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Onboardings on CompanyID');
    }
    const logString = logger.info(`${req.userName} Accessed all the Onboardings with CompanyID - ${req.params.companyId}`)
      .transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Failed to Access Onboardings with CompanyID - ${req.params.companyId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch Onboardings for the Provided CompanyID', details: error });
  }
});

const onboardingsOnUserID = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const onboardings = await onboardingService.onboardingsOnUserID(req.params.userId, page, limit);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Onboardings on UserID');
    }
    const logString = logger.info(`${req.userName} Accessed all the Onboardings with UserID - ${req.params.userId} `)
      .transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Onboardings with UserID - ${req.params.userId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch Onboardings for the Provided UserID', details: error });
  }
});

const onboardingsOnStageID = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const onboardings = await onboardingService.onboardingsOnStageID(req.params.stageId, page, limit);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Onboardings on StageID');
    }
    const logString = logger.info(`${req.userName} Accessed all the Onboardings with StageId - ${req.params.stageId}`)
      .transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Onboardings with StageId - ${req.params.stageId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch Onboardings for the Provided StageID', details: error });
  }
});

const onboardingsById = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.onboardingsById(req.params.onboardingsId);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Onboardings');
    }
    const logString = logger.info(
      `${req.userName} Accessed all the Onboardings with OnboardingsID - ${req.params.onboardingsId}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Onboardings with OnboardingsID - ${req.params.onboardingsId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch Onboardings for the given ID', details: error });
  }
});

const deleteOnboardings = catchAsync(async (req, res) => {
  try {
    const existingOnboardingsbyID = await onboardingService.onboardingsById(req.params.onboardingsId);
    const updatedOnboardings = await onboardingService.deleteOnboardings(req.params.onboardingsId);
    const updatedBy = await onboardingService.updateUpdatedBy(req.params.onboardingsId, req.userId);
    const logMessage = logOnboardingsDeletion(req.userId, updatedOnboardings);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.onboardingsId,
      'onboardings',
      existingOnboardingsbyID,
      {},
      {},
      logMessage
    );
    if (!updatedOnboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete Onboardings');
    }
    const logString = logger.info(`${req.userName} Deleted Onboardings with OnboardingsID - ${req.params.onboardingsId})`)
      .transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(updatedOnboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Delete Onboardings with OnboardingsID - ${req.params.onboardingsId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Delete the Onboardings fo the provided ID', details: error });
  }
});

function logOnboardingsDeletion(userId, updatedOnboardings) {
  const logMsg = `User ${userId} Deleted Onboardings ${updatedOnboardings._id}`;
  return logMsg;
}

const onboardingsOnStatus = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.onboardingsOnStatus(req.params.status);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Onboardings');
    }
    const logString = logger.info(`${req.userName} Accessed all the Onboardings with Status - ${req.params.status}`)
      .transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Onboardings with Status - ${req.params.status}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch Onboardings for the Given Status', details: error });
  }
});

const filterOnDatesStatusAndStageTypes = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const onboardings = await onboardingService.filterOnDatesStatusAndStageTypes(req.body, page, limit);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Onboardings');
    }
    const logString = logger.info(`${req.userName} Accessed All the Onboarding by filtering on Status / Dates / Stage Type`)
      .transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access all the onboardings by filtering on Status / Dates / Stage Type`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch onboardings on applying the Filter (Status/Dates/StageType)' });
  }
});

const listOfUsersAndCompaniesWithStatus = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const onboardings = await onboardingService.listOfUsersAndCompaniesWithStatus(req.body, page, limit);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch list of Users');
    }
    const logString = logger.info(`${req.userName} Accessed list of All Users`).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Access the list of Users`).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Access the list of Users' });
  }
});

const getOnboardingStatusCount = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.getOnboardingStatusCount(req.body);
    const logString = logger.info(`${req.userName} Onboarding Status Count`).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    console.log(error);
    const logString = logger.error(`${req.userName} Unable to get Onboarding Status Count`).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Unable to get Onboarding Status Count' });
  }
});

const extendedListOfUsersAndCompanies = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.extendedListOfUsersAndCompanies(req.params.onboardingId);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Employee Details for the given ID');
    }
    const logString = logger.info(
      `${req.userName} Accessed Employee Details for the given Onboarding ID ${req.params.onboardingId}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access Employee Details for the given Onboarding ID ${req.params.onboardingId}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Access Employee Details for the given Onboarding ID' });
  }
});

const onboardingProcessForward = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.onboardingProcessForward(req.body, req.params.onboardingId, req.userId);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update the Process');
    }
    const logString = logger.info(`${req.userName} Updated the Onbarding Process from one Stage to next (Moved Forward)`)
      .transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Onbardings Process from one Stage to next (Move Forward), encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res
      .status(400)
      .json({ message: 'Failed to Update Onbardings Process from one Stage to next (Move Forward)', details: error });
  }
});

const onboardingProcessBackward = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.onboardingProcessBackward(req.params.onboardingId);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update the Process');
    }
    const logString = logger.info(`${req.userName} Updated the Onbarding Process from one Stage to other (Moved Backward)`)
      .transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Onbardings Process from one Stage to other (Move Backward), encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res
      .status(400)
      .json({ message: 'Failed to Update Onbardings Process from one Stage to other (Move Backward)', details: error });
  }
});

const onboardingPipeline = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.getOnboardingPipeline(req.body);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the Onboardings Pipeline');
    }
    const logString = logger.info(`${req.userName} Fetched all the Onboardings Data on Status PipeLineAPI`).transports[0]
      .logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Fetch all the Onboardings Data on Status PipeLineAPI, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch all the Onboardings Data on Status PipeLineAPI', details: error });
  }
});

const getPipelineList = catchAsync(async (req, res) => {
  try {
    const onboardings = await onboardingService.getDiffPipelineList(req.query, req.query.page, req.query.limit);
    if (!onboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the Onboardings Pipeline');
    }
    const logString = logger.info(`${req.userName} Fetched all the Onboardings Data on Status PipeLineAPI`).transports[0]
      .logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(onboardings);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Failed to Fetch all the Onboardings Data on Status PipeLineAPI, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch all the Onboardings Data on Status PipeLineAPI', details: error });
  }
});

const escapeRegex = string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters for regex
};
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
const generateUniqueReferenceNumber = async (company_id, company_name) => {
  let companyCode = 'GEN'; // Default code
  if (company_name) {
    companyCode = generateCompanyCode(company_name);
  } else if (company_id) {
    const company = await Companies.findById(company_id);
    if (company?.company_name) {
      companyCode = generateCompanyCode(company.company_name);
    }
  }

  // Escape special characters in the company code for regex
  const escapedCompanyCode = escapeRegex(companyCode);

  // Generate a unique reference number
  let uniqueString = `PEO-${escapedCompanyCode}`;
  const count = await Users.countDocuments({ reference_number: new RegExp(`^${uniqueString}`) });
  uniqueString += `-${String(count + 1).padStart(4, '0')}`;

  return uniqueString;
};
const newOnboardingCreationAPIUsers = catchAsync(async (req, res) => {
  try {
    if (req.body.salary && req.body.salary['housing/hra_allowance']) {
      req.body.salary.housing_allowance = req.body.salary['housing/hra_allowance'];
      delete req.body.salary['housing/hra_allowance'];
    }
    if (req.body.salary && req.body.salary['transportation/car_allowance']) {
      req.body.salary.transportation_allowance = req.body.salary['transportation/car_allowance'];
      delete req.body.salary['transportation/car_allowance'];
    }
    let usersBody = {
      company_id: req.body.company_id,
      company_ID: req.body.company_id,
      personal: req.body.personal,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
      dob: req.body.dob,
      role_ID: req.body.role_ID,
      user_status: req.body.user_status,
      image_url: req.body.image_url,
      email: req.body.email,
      place_of_registration: req.body.place_of_registration,
      contact_number: req.body.contact_number,
      date_of_joining: req.body.employment.date_of_joining,
      designation: req.body.employment.designation,
      employment: req.body.employment,
      payroll_details: req.body.payroll_details,
      dependent_details: req.body.dependent_details,
      assigned_escalation_manager: req.body.assigned_escalation_manager ? req.body.assigned_escalation_manager : null,
      // assigned_insurance_agent: req.body.assigned_insurance_agent ? req.body.assigned_insurance_agent :{},
      assigned_hr_specialist: req.body.assigned_hr_specialist ? req.body.assigned_hr_specialist : null,
      assigned_support_agent: req.body.assigned_support_agent ? req.body.assigned_support_agent : null,
      user_status: 'onboarding',
      created_by: req.userId,
      phone: req.body.phone,
      salary: req.body.salary,
      reporting: {
        department: '',
        work_location: '',
        manager: '',
        senior_manager: ''
      }
    };
    if (req.body.assigned_insurance_agent && req.body.assigned_insurance_agent.id.length > 0) {
      usersBody.insurance_agent = {
        _id: req.body?.assigned_insurance_agent?._id,
        full_name: req?.body.assigned_insurance_agent?.full_name,
        email: req.body?.assigned_insurance_agent?.email
      };
      usersBody.assigned_insurance_agent = req.body?.assigned_insurance_agent || {};
    }
    const companyDoc = await Companies.findById(req.body.company_id);
    if (!companyDoc) throw new Error('invalid company id');
    // generate unique refeence number for user
    const referenceNumber = await generateUniqueReferenceNumber(req.body.company_id, companyDoc.company_name);
    usersBody.reference_number = referenceNumber;
    let password = usersBody.first_name.slice(0, 4).toUpperCase() + usersBody.dob;
    usersBody.password = password;
    let users = await new Users(usersBody).save();
    res.status(httpStatus.CREATED).send(users);
    let employment_type = req.body.employment.employment_type;
    let processArray = [];

    if (employment_type == 'Employment Visa (2-Year)') {
      processArray = await Processes.find({ process_name: 'onboarding process' });
    } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
      processArray = await Processes.find({ process_name: 'mission visa onboarding process' });
    } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
      processArray = await Processes.find({ process_name: 'work permit onboarding process' });
    }
    // console.log(processArray, "process array")
    let onboardingsBody = {
      status: 'Employee Details',
      stage_type: 'onboarding',
      attachments: [],
      process_type: 'onboarding process',
      company_id: req.body.company_id,
      user_location: req.body.user_location,
      user_id: users._id,
      processes: []
    };
    let docCloneIds = [];
    let isFetchedContractEes = false;
    let condition;
    let conditionType;
    let document_template;

    const documents = [];
    let processNameFromProcessArray = processArray[0].process_name;
    for (const process of processArray[0].stages) {
      const documentActions = [];
      for (const action of process.actions) {
        let counter = 0;
        // console.log(action, "counting action=>", counter+=1);
        if (action.action_type === 'document') {
          if (action.condition) {
            conditionType = req.body.employment.visa_sponsor_type == 'Dynamic Employment Services' ? 'DES' : 'EES';
            //console.log("***********************************************************************");
            //console.log(conditionType, "the condition type")
            condition = {
              'condition.type': conditionType,
              'condition.document_name': action.condition.document_name,
              'condition.employment_type': req.body.employment.employment_type
            };

            if (conditionType === 'EES' && process.stage_name == 'Create Employment contract')
              condition['condition.document_name'] = 'employment_contract_ees';

            if (conditionType === 'EES' && process.stage_name == 'Create Work Order') {
              condition['condition.document_name'] = 'work_order_ees';
            }

            if (
              conditionType === 'EES' &&
              process.stage_name == 'Create Work Order' &&
              processNameFromProcessArray == 'mission visa onboarding process'
            ) {
              condition['condition.document_name'] = 'work_order_mission_visa_ees';
            }

            if (action.condition.document_name !== 'work_order') {
              //console.log("running deletion")
              delete condition['condition.employment_type'];
            }

            //console.log("start condition",condition, "print for condition")
            document_template = await documentTemplateService.getDocTemplatesOnCondition(condition);
            console.log(document_template._id, 'id of the template^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
            //console.log("start condition", condition, "print for condition");
            //console.log("+-----------------------------------------------------------------------------");
          } else {
            //console.log("executing else statement")
            document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
          }

          // console.log("+++++++++++", condition, "++++++++++");
          const template = document_template;
          template.auto_replace_keys.forEach(replaceKeys => {
            replaceKeys.fk_id = '';
          });
          let templateBody = {};
          templateBody.auto_replace_keys = template.auto_replace_keys;
          templateBody.user_input_keys = template.user_input_keys;
          templateBody.name = template.name;
          templateBody.content = template.content;
          templateBody.module = template.module;
          if (action.condition) {
            templateBody.condition = {
              type: conditionType,
              document_name: action.condition.document_name,
              employment_type: req.body.employment.employment_type
            };
          }
          console.log(templateBody, '===================================>template body');
          const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
            templateBody
          );
          console.log(create_document_template_clone._id, '################### id of the clone');
          console.log(
            '+++++++++++++++++++++++++++++++++++++++++++++==========',
            create_document_template_clone,
            '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++'
          );
          action.template_id = create_document_template_clone._id;
          docCloneIds.push({ _id: create_document_template_clone._id });
          documentActions.push(true);
        } else {
          onboardingsBody.processes = processArray[0].stages;
          documentActions.push(true);
        }
      }

      if (documentActions.some(Boolean)) {
        documents.push(process);
      }
    }
    // return onboardingsBody
    const reconstructedUserBody = {
      company_name: companyDoc.company_name,
      company_email: companyDoc.email,
      first_name: users.first_name,
      last_name: users.last_name,
      employment_type: users.employment.employment_type,
      email: users.email
    };
    const onboardings = await onboardingService.createOnboardings(
      onboardingsBody,
      reconstructedUserBody,
      req.body?.assigned_insurance_agent
    );
    // console.log("result from onboarding model", onboardings)
    const created_by = await onboardingService.updateCreatedBy(onboardings._id, req.userId);
    const logMessage = logOnboardingsCreation(req.userId, onboardings);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      onboardings._id,
      'onboardings',
      {},
      onboardings,
      {},
      logMessage
    );
    const logString = logger.info(`${req.userName} Created a Onboardings with ID ${onboardings._id}`).transports[0]
      .logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: onboardings._id } });
    console.log('start of final result================>', DocumentTemplatesClone, 'final result^^^^^^^^^^^^^^^^^^^^^^^^^');
    const emails = await onboardingService.notifyUser(onboardings);
    // res.status(httpStatus.CREATED).send(onboardings);
    // send details received email
    let searchTerm = {};
    if (
      users.employment.employment_type == 'Employment Visa (2-Year)' ||
      users.employment.employment_type == 'Work Permit (for UAE Resident visa holders)' ||
      users.employment.employment_type == 'employment_visa'
    ) {
      console.log('condition for not mission visa');
      searchTerm.templateName = 'Employee Details (Email to Client)';
    } else if (users.employment.employment_type == 'Mission Visa (3 Months Single Entry)') {
      console.log('esnding details rece email for mission visa');
      searchTerm.templateName = 'Employee Details (Mission Visa Client Email)';
    }

    const detailsReceeivedTemplate = await emailTemplateService.getEmailTemplateByName(searchTerm);
    if (detailsReceeivedTemplate) {
      console.log('email template for details approved found', detailsReceeivedTemplate._id);
      const templateWithReplacedKeys = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
        detailsReceeivedTemplate._id,
        onboardings._id,
        null,
        null,
        null
      );
      if (templateWithReplacedKeys) {
        console.log('replaced keys on ', templateWithReplacedKeys._id);
        console.log('sending email to cleint with replaced details');
        console.log('this is the company email', companyDoc.email);
        templateWithReplacedKeys.to = [companyDoc.email];
        console.log('this is the replaced to add', templateWithReplacedKeys.to);
        await sendRawEmail(
          templateWithReplacedKeys.to,
          templateWithReplacedKeys.subject,
          templateWithReplacedKeys.content,
          templateWithReplacedKeys.cc,
          []
        );
      }
    }
    /**
     * =========================================================================================
     * Create insurance inquiry
     * =========================================================================================
     */
    let insuranceInquiryBody = {
      source: 'PEO Services',
      user_id: users._id,
      company_id: req.body.company_id,
      request_mail_id: req.userEmail || 'sahiba@nathanhr.com',
      agent_id: req.body?.assigned_insurance_agent?._id || '667910bce76ebe86ddb2cb89',
      parent_company_id:
        users.employment.visa_sponsor_type === 'Dynamic Employment Services'
          ? config.parentCompanyIds.dynamicEmploymentServices
          : config.parentCompanyIds.executiveEmploymentServices
    };
    let response;
    try {
      // response = await axios.post('https://insurance-api-staging.devnhr.com/insurance/crm/getnewlead', insuranceInquiryBody);
      // response = await axios.post(`${config.insurancePortalUrl}insurance/crm/getnewlead`, insuranceInquiryBody);
      console.log('response from insurance api', response?.data);
      const insuranceInquiry = response?.data;
      console.log('insurance inquiry created', insuranceInquiry);
    } catch (error) {
      console.log('error in creating insurance inquiry', error);
      // throw error;
    }
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Create Onboardings, encountered the following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    console.log(error);
    throw new Error(error);
    // res.status(400).json({ message: "Failed to create Onboarding. Please Check the Input", details: error, });
  }
});

/**
 * =========================================================================================================================
 * Function to onboard employees from link sent to clients via email
 * The implementation of this function is based on provided tokens on request.headers
 * Note that these tokens expire after 3 days, and JWT.verify will thorw an expiration error
 * =========================================================================================================================
 */
const onboardViaLink = catchAsync(async (req, res) => {
  try {
    if (req.body.salary && req.body.salary['housing/hra_allowance']) {
      req.body.salary.housing_allowance = req.body.salary['housing/hra_allowance'];
      delete req.body.salary['housing/hra_allowance'];
    }
    if (req.body.salary && req.body.salary['transportation/car_allowance']) {
      req.body.salary.transportation_allowance = req.body.salary['transportation/car_allowance'];
      delete req.body.salary['transportation/car_allowance'];
    }
    // Check if authorization header exists
    if (!req.headers.authorization) {
      throw new ApiError(611, 'Authorization token is required. Please ensure you are using a valid onboarding link.');
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new ApiError(611, 'Token not found. Please request a new onboarding link from your administrator.');
    }
    const verifiedToken = await tokenService.verifyToken(token, tokenTypes.ONBOARDING);
    if (!verifiedToken) {
      throw new ApiError(611, 'Invalid token. Please request a new onboarding link from your administrator.');
    }
    let usersBody = {
      company_id: req.body.company_id,
      personal: req.body.personal,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
      dob: req.body.dob,
      role_ID: req.body.role_ID,
      user_status: req.body.user_status,
      image_url: req.body.image_url,
      email: req.body.email,
      place_of_registration: req.body.place_of_registration,
      contact_number: req.body.contact_number,
      date_of_joining: req.body.employment.date_of_joining,
      designation: req.body.employment.designation,
      employment: req.body.employment,
      payroll_details: req.body.payroll_details,
      dependent_details: req.body.dependent_details,
      user_status: 'onboarding',
      created_by: req.userId,
      phone: req.body.phone,
      salary: req.body.salary,
      reporting: {
        department: '',
        work_location: '',
        manager: '',
        senior_manager: ''
      }
    };
    if (req.body.assigned_insurance_agent && req.body.assigned_insurance_agent.id.length > 0) {
      usersBody.insurance_agent = {
        _id: req.body?.assigned_insurance_agent?._id,
        full_name: req?.body.assigned_insurance_agent?.full_name,
        email: req.body?.assigned_insurance_agent?.email
      };
      usersBody.assigned_insurance_agent = req.body?.assigned_insurance_agent || {};
    }
    const companyDoc = await Companies.findById(req.body.company_id);
    if (!companyDoc) throw new Error('invalid company id');
    let password = usersBody.first_name.slice(0, 4).toUpperCase() + usersBody.dob;
    usersBody.password = password;
    let users = await new Users(usersBody).save();
    res.status(httpStatus.CREATED).send(users);
    let employment_type = req.body.employment.employment_type;
    let processArray = [];

    if (employment_type == 'Employment Visa (2-Year)') {
      processArray = await Processes.find({ process_name: 'onboarding process' });
    } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
      processArray = await Processes.find({ process_name: 'mission visa onboarding process' });
    } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
      processArray = await Processes.find({ process_name: 'work permit onboarding process' });
    }
    // console.log(processArray, "process array")
    let onboardingsBody = {
      status: 'Employee Details',
      stage_type: 'onboarding',
      attachments: [],
      process_type: 'onboarding process',
      company_id: req.body.company_id,
      user_location: req.body.user_location,
      user_id: users._id,
      processes: []
    };
    let docCloneIds = [];
    let isFetchedContractEes = false;
    let condition;
    let conditionType;
    let document_template;

    const documents = [];
    let processNameFromProcessArray = processArray[0].process_name;
    for (const process of processArray[0].stages) {
      const documentActions = [];
      for (const action of process.actions) {
        let counter = 0;
        if (action.action_type === 'document') {
          if (action.condition) {
            conditionType = req.body.employment.visa_sponsor_type == 'Dynamic Employment Services' ? 'DES' : 'EES';
            condition = {
              'condition.type': conditionType,
              'condition.document_name': action.condition.document_name,
              'condition.employment_type': req.body.employment.employment_type
            };

            if (conditionType === 'EES' && process.stage_name == 'Create Employment contract')
              condition['condition.document_name'] = 'employment_contract_ees';

            if (conditionType === 'EES' && process.stage_name == 'Create Work Order') {
              condition['condition.document_name'] = 'work_order_ees';
            }

            if (
              conditionType === 'EES' &&
              process.stage_name == 'Create Work Order' &&
              processNameFromProcessArray == 'mission visa onboarding process'
            ) {
              condition['condition.document_name'] = 'work_order_mission_visa_ees';
            }

            if (action.condition.document_name !== 'work_order') {
              //console.log("running deletion")
              delete condition['condition.employment_type'];
            }

            //console.log("start condition",condition, "print for condition")
            document_template = await documentTemplateService.getDocTemplatesOnCondition(condition);
          } else {
            //console.log("executing else statement")
            document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
          }

          const template = document_template;
          template.auto_replace_keys.forEach(replaceKeys => {
            replaceKeys.fk_id = '';
          });
          let templateBody = {};
          templateBody.auto_replace_keys = template.auto_replace_keys;
          templateBody.user_input_keys = template.user_input_keys;
          templateBody.name = template.name;
          templateBody.content = template.content;
          templateBody.module = template.module;
          if (action.condition) {
            templateBody.condition = {
              type: conditionType,
              document_name: action.condition.document_name,
              employment_type: req.body.employment.employment_type
            };
          }
          const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
            templateBody
          );
          action.template_id = create_document_template_clone._id;
          docCloneIds.push({ _id: create_document_template_clone._id });
          documentActions.push(true);
        } else {
          onboardingsBody.processes = processArray[0].stages;
          documentActions.push(true);
        }
      }

      if (documentActions.some(Boolean)) {
        documents.push(process);
      }
    }

    const reconstructedUserBody = {
      company_name: companyDoc.company_name,
      company_email: companyDoc.email,
      first_name: users.first_name,
      last_name: users.last_name,
      employment_type: users.employment.employment_type,
      email: users.email
    };
    // return onboardingsBody
    const onboardings = await onboardingService.createOnboardings(
      onboardingsBody,
      reconstructedUserBody,
      req.body?.assigned_insurance_agent
    );

    await DocumentTemplatesClone.updateMany(
      { _id: { $in: docCloneIds } },
      { $set: { module_id: onboardings._id } },
      { new: true }
    );
    const emails = await onboardingService.notifyUser(onboardings);
    // notify admin
    /**
     * =========================================================================================
     * Create insurance inquiry
     * =========================================================================================
     */
    await onboardingService.notifyAdmin(onboardings, users);
    let insuranceInquiryBody = {
      source: 'PEO Services',
      user_id: users._id,
      company_id: req.body.company_id,
      request_mail_id: req?.userEmail || 'sahiba@nathanhr.com',
      agent_id: req.body?.assigned_insurance_agent?._id || '667910bce76ebe86ddb2cb89',
      parent_company_id:
        users.employment.visa_sponsor_type === 'Dynamic Employment Services'
          ? config.parentCompanyIds.dynamicEmploymentServices
          : config.parentCompanyIds.executiveEmploymentServices
    };
    let response;
    try {
      // response = await axios.post('https://insurance-api-staging.devnhr.com/insurance/crm/getnewlead', insuranceInquiryBody);
      // response = await axios.post(`${config.insurancePortalUrl}insurance/crm/getnewlead`, insuranceInquiryBody);
      console.log('response from insurance api', response.data);
      const insuranceInquiry = response.data;
      console.log('insurance inquiry created', insuranceInquiry);
    } catch (error) {
      console.log('error in creating insurance inquiry', error);
      // throw error;
    }
  } catch (error) {
    // If it's already an ApiError, re-throw it to preserve status code and message
    if (error instanceof ApiError) {
      throw error;
    }
    // Otherwise, wrap it in an ApiError
    throw new ApiError(error?.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error?.message || 'An error occurred');
  }
});

/**
 * =========================================================================================================================
 * Function to proceed with onboarding process for employees whose onboarding failled
 * The implementation of this function is ideal for cases where onboarding processes fail prematurely
 * =========================================================================================================================
 */
const continueWithOnboardingProcess = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.userId);
    if (!user) throw new Error('User not found');

    let employment_type = user.employment.employment_type;

    // console.log(user.employment.visa_sponsor_type)
    // console.log(user.personal.nationality)
    // console.log(user.company_id)
    // console.log(user._id)

    let processArray = [];

    if (employment_type == 'Employment Visa (2-Year)') {
      processArray = await Processes.find({ process_name: 'onboarding process' });
    } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
      processArray = await Processes.find({ process_name: 'mission visa onboarding process' });
    } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
      processArray = await Processes.find({ process_name: 'work permit onboarding process' });
    }
    // console.log(processArray, "process array")
    let onboardingsBody = {
      status: 'Employee Details',
      stage_type: 'onboarding',
      attachments: [],
      process_type: 'onboarding process',
      company_id: user.company_id,
      user_location: user.personal.nationality,
      user_id: user._id,
      processes: []
    };
    let docCloneIds = [];
    let isFetchedContractEes = false;
    let condition;
    let conditionType;
    let document_template;

    const documents = [];
    let processNameFromProcessArray = processArray[0].process_name;
    for (const process of processArray[0].stages) {
      const documentActions = [];
      for (const action of process.actions) {
        let counter = 0;
        // console.log(action, "counting action=>", counter+=1);
        if (action.action_type === 'document') {
          if (action.condition) {
            conditionType = user.employment.visa_sponsor_type == 'Dynamic Employment Services' ? 'DES' : 'EES';
            //console.log("***********************************************************************");
            //console.log(conditionType, "the condition type")
            condition = {
              'condition.type': conditionType,
              'condition.document_name': action.condition.document_name,
              'condition.employment_type': user.employment.employment_type
            };

            if (conditionType === 'EES' && process.stage_name == 'Create Employment contract')
              condition['condition.document_name'] = 'employment_contract_ees';

            if (conditionType === 'EES' && process.stage_name == 'Create Work Order') {
              condition['condition.document_name'] = 'work_order_ees';
            }

            if (
              conditionType === 'EES' &&
              process.stage_name == 'Create Work Order' &&
              processNameFromProcessArray == 'mission visa onboarding process'
            ) {
              condition['condition.document_name'] = 'work_order_mission_visa_ees';
            }

            if (action.condition.document_name !== 'work_order') {
              //console.log("running deletion")
              delete condition['condition.employment_type'];
            }

            //console.log("start condition",condition, "print for condition")
            document_template = await documentTemplateService.getDocTemplatesOnCondition(condition);

            //console.log("start condition", condition, "print for condition");
            //console.log("+-----------------------------------------------------------------------------");
          } else {
            //console.log("executing else statement")
            document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
          }

          const template = document_template;
          template.auto_replace_keys.forEach(replaceKeys => {
            replaceKeys.fk_id = '';
          });
          let templateBody = {};
          templateBody.auto_replace_keys = template.auto_replace_keys;
          templateBody.user_input_keys = template.user_input_keys;
          templateBody.name = template.name;
          templateBody.content = template.content;
          templateBody.module = template.module;
          if (action.condition) {
            templateBody.condition = {
              type: conditionType,
              document_name: action.condition.document_name,
              employment_type: user.employment.employment_type
            };
          }
          const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
            templateBody
          );
          action.template_id = create_document_template_clone._id;
          docCloneIds.push({ _id: create_document_template_clone._id });
          documentActions.push(true);
        } else {
          onboardingsBody.processes = processArray[0].stages;
          documentActions.push(true);
        }
      }

      if (documentActions.some(Boolean)) {
        documents.push(process);
      }
    }

    // return onboardingsBody
    const onboardings = await onboardingService.createOnboardings(onboardingsBody);
    const created_by = await onboardingService.updateCreatedBy(onboardings._id, req.userId);
    const logMessage = logOnboardingsCreation(req.userId, onboardings);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      onboardings._id,
      'onboardings',
      {},
      onboardings,
      {},
      logMessage
    );
    const logString = logger.info(`${req.userName} Created a Onboardings with ID ${onboardings._id}`).transports[0]
      .logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: onboardings._id } });
    const emails = await onboardingService.notifyUser(onboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Create Onboardings, encountered the following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    console.log(error);
    throw new Error(error);
  }
};

const listOfOnboardingStatus = catchAsync(async (req, res) => {
  try {
    const result = await onboardingService.listOfOnboardingStatus(req.query, req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Status');
    }
    const logString = logger.info(`${req.userName} Accesses the list of Status of Onboardings `).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Status of Onboardings, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Status of Onboardings ', details: error });
  }
});

const getDashboardCount = catchAsync(async (req, res) => {
  try {
    const AllProcess = await processesService.getProcessOnModuleName('onboarding');
    if (!AllProcess) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to find process');
    }
    const result = await onboardingService.getApplicationDistribution(AllProcess);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Dashboard COunt');
    }
    const logString = logger.info(`${req.userName} Accesses the list of Status of Onboardings `).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Status of Onboardings, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Status of Onboardings ', details: error });
  }
});

const ProcessDetailsByInvoice = catchAsync(async (req, res) => {
  try {
    const result = await onboardingService.getProcessDetailForInvoice(req.params.invoiceId);
    res.status(httpStatus.OK).send(result[0]);
  } catch (error) {
    res.status(400).json({ message: 'Failed to get the Data', details: error });
  }
});

const GeneratedDocument = catchAsync(async (req, res) => {
  try {
    console.log('clinton');
    const result = await onboardingService.getInvoiceDocuments(req.params.invoiceId);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.status(400).json({ message: 'Failed to get the Data', details: error });
  }
});

const getOnboardingOnCompanyId = catchAsync(async (req, res) => {
  try {
    const result = await onboardingService.getOnboardingsOnCompanyId(req.params.companyId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get onboardings on company id');
    }
    const logString = logger.info(`${req.userName} Accesses the get onboardings on company id `).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get onboardings on company id, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to get onboardings on company id ', details: error });
  }
});

const bulkUploadOnboardings = catchAsync(async(req,res)=>{
  try{
      if (!req.files || !req.files.file) {
                  throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
              }
      // Pass the whole req to the service, like leads
      const result = await onboardingService.bulkUploadOnboardings(req);
      res.status(httpStatus.OK).json({
                  success: true,
                  message: result.message,
                  data: {
                      added: result.added,
                      duplicates: result.duplicates,
                      companiesReused: result.companiesReused,
                      errors: result.errors,
                      totalProcessed: result.totalProcessed
                  }
              });
  }catch(error){
    const logString = logger.error(
      `${req.userName} Failed to bulk upload onboardings, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to bulk upload onboardings', details: error?.message });
  }
})
const exportBulkUploadTemplate = catchAsync(async (req, res) => {
  try {
    const buffer = await onboardingService.exportBulkUploadTemplate();
    if (!buffer) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot export bulk upload template');
    }
    const logString = logger.info(`${req.userName} Exported bulk upload template `).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Onboarding_Bulk_Upload_Template.xlsx');
    res.send(buffer);
  } catch (error) {
    const logString = logger.error(
      `${requserName} Failed to export bulk upload template, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('onboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to export bulk upload template', details: error?.message });
  }
});

module.exports = {
  getPipelineList,
  onboardingPipeline,
  getOnboardingStatusCount,
  createOnboardings,
  updateOnboardingsOnId,
  listAllOnboardings,
  getOnboardings,
  onboardingsById,
  onboardingsOnUserID,
  onboardingsOnStageID,
  deleteOnboardings,
  onboardingsOnStatus,
  filterOnDatesStatusAndStageTypes,
  listOfUsersAndCompaniesWithStatus,
  extendedListOfUsersAndCompanies,
  onboardingProcessForward,
  onboardingProcessBackward,
  newOnboardingCreationAPIUsers,
  listOfOnboardingStatus,
  getDashboardCount,
  ProcessDetailsByInvoice,
  GeneratedDocument,
  getOnboardingOnCompanyId,
  continueWithOnboardingProcess,
  onboardViaLink,
  exportBulkUploadTemplate,
  bulkUploadOnboardings
};
