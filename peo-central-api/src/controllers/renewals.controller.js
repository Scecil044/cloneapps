const httpStatus = require('http-status');
const { renewalsService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { activityService } = require('../services');
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require('../services');
const { diff } = require('deep-object-diff');
const { Processes } = require('../models');
const { documentTemplateService } = require('../services');
const { documentTemplateCloneService } = require('../services');
const { DocumentTemplatesClone } = require('../models');


const createRenewals1 = catchAsync(async (req, res) => {
  console.log("creating a new ren+++++++_----")
  try {
    let renewalsReqBody = {
      user_id: req.body.user_id,
      company_id: req.body.company_id,
      process_type: 'renewal request',
      status: 'Notify Employer',
      processes: [],
    };

    // Fetch the process array for renewals
    let processArray = await Processes.find({ process_name: 'renewal request' });
    let docCloneIds = [];
    console.log("**************************pr**", processArray[0])
    const documents = await Promise.all(
      processArray[0].stages.map(async (process) => {
        const documentActions = await Promise.all(
          process.actions.map(async (action) => {
            if (action.action_type === 'document') {
              var document_template;
              console.log("action---", action)

              var conditionType;
              if (action.condition) {
                conditionType = req.body.visa_sponsor_type == 'Dynamic Employment Services' ? 'DES' : 'EES';
                console.log('ct+++++',conditionType)
                var condition = {
                  "condition.type": conditionType,
                  "condition.document_name": action.condition.document_name,
                  "condition.employment_type": req.body.employment_type,
                };

                if (action.condition.document_name !== 'work_order') {
                  delete condition["condition.employment_type"];
                }

                document_template = await documentTemplateService.getDocTemplatesOnCondition(condition);
              } else {
                document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
              }

              const template = document_template;
              template.auto_replace_keys.forEach((replaceKeys) => {
                replaceKeys.fk_id = '';
              });

              let templateBody = {
                auto_replace_keys: template.auto_replace_keys,
                user_input_keys: template.user_input_keys,
                name: template.name,
                content: template.content,
                module: template.module,
              };

              if (action.condition) {
                console.log("appending condition to template body**")
                templateBody.condition = {
                  type: conditionType,
                  document_name: action.condition.document_name,
                  employment_type: req.body.employment_type,
                };
              }
              const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(templateBody);
              action.template_id = create_document_template_clone._id;
              renewalsReqBody.processes = processArray[0].stages;
              docCloneIds.push({ _id: create_document_template_clone._id });
              return true;
            }
            return false;
          })
        );

        if (documentActions.some(Boolean)) {
          return process;
        }
      })
    );

    // Create renewals record
    const renewals = await renewalsService.createRenewals(renewalsReqBody);
    await renewalsService.updateCreatedBy(renewals._id, req.userId);

    // Logging and activity creation
    const logMessage = logRenewalsProcessCreation(req.userId, renewals);
    await activityService.createActivity(req.userId, renewals._id, 'renewals', {}, renewals, {}, logMessage);
    const logString = logger.info(`${req.userName} Created a Renewals Process with ID ${renewals._id}`).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);

    // Update document template clones with the renewals ID
    await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: renewals._id } });

    res.status(httpStatus.CREATED).send(renewals);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Create Renewals Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Renewals Process. Please Check the Input', details: error });
  }
}
)

const createRenewals = catchAsync(async (req, res) => {
  try {
    let renewalsReqBody = {
      user_id: req.body.user_id,
      company_id: req.body.company_id,
      process_type: 'renewal request',
      status: 'Notify Employer',
      processes: [],
    };
    // Fetch the process array for renewals
    let processArray = await Processes.find({ process_name: 'renewal request' });
    let docCloneIds = [];
    const documents = await Promise.all(
      processArray[0].stages.map(async (process) => {
        const documentActions = await Promise.all(
          process.actions.map(async (action) => {
            if (action.action_type === 'document') {
              var document_template;

              var conditionType;
              if (action.condition) {
                conditionType = req.body.visa_sponsor_type == 'Dynamic Employment Services' ? 'DES' : 'EES';
                console.log('ct+++++',conditionType)
                var condition = {
                  "condition.type": conditionType,
                  "condition.document_name": action.condition.document_name,
                  "condition.employment_type": req.body.employment_type,
                };

                if(conditionType === 'EES') condition["condition.document_name"] = "work_order_renewals_ees"

                if (action.condition.document_name !== 'work_order') {
                  delete condition["condition.employment_type"];
                }

                document_template = await documentTemplateService.getDocTemplatesOnCondition(condition);
              } else {
                document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
              }

              const template = document_template;
              template.auto_replace_keys.forEach((replaceKeys) => {
                replaceKeys.fk_id = '';
              });

              let templateBody = {
                auto_replace_keys: template.auto_replace_keys,
                user_input_keys: template.user_input_keys,
                name: template.name,
                content: template.content,
                module: template.module,
              };

              if (action.condition) {
                templateBody.condition = {
                  type: conditionType,
                  document_name: action.condition.document_name,
                  employment_type: req.body.employment_type,
                };
              }
              const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(templateBody);
              action.template_id = create_document_template_clone._id;
              renewalsReqBody.processes = processArray[0].stages;
              docCloneIds.push({ _id: create_document_template_clone._id });
              return true;
            }
            return false;
          })
        );

        if (documentActions.some(Boolean)) {
          return process;
        }
      })
    );

    // Create renewals record
    const renewals = await renewalsService.createRenewals(renewalsReqBody);
    await renewalsService.updateCreatedBy(renewals._id, req.userId);

    // Logging and activity creation
    const logMessage = logRenewalsProcessCreation(req.userId, renewals);
    await activityService.createActivity(req.userId, renewals._id, 'renewals', {}, renewals, {}, logMessage);
    const logString = logger.info(`${req.userName} Created a Renewals Process with ID ${renewals._id}`).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);

    // Update document template clones with the renewals ID
    await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: renewals._id } });

    res.status(httpStatus.CREATED).send(renewals);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Create Renewals Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Renewals Process. Please Check the Input', details: error });
  }
});


function logRenewalsProcessCreation(userId, renewals) {
  const logMsg = `User ${userId} Created renewals Process ${renewals._id}`;
  return logMsg;
}

const listAllRenewals = catchAsync(async (req, res) => {
  try {
    const renewals = await renewalsService.listAllRenewals();
    console.log(typeof renewals);
    // if (!renewals) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Renewals Processes');
    // }
    // const logString = (logger.info(`${req.userName} Accessed all the Renewals Process Data`)).transports[0].logString;
    // await loggerService.createLogger('renewals', req.userId, logString);
    res.send(renewals);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Renewals Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the Renewals Processes', details: error });
  }
});

const getRenewalsOnUserId = catchAsync(async (req, res) => {
  try {
    const renewals = await renewalsService.getRenewalsOnUserId(req.params.userId);
    if (!renewals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all renewals Processes on UserID');
    }
    const logString = logger.info(`${req.userName} Accessed all the renewals Process Data on userID ${req.params.userId}`)
      .transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(httpStatus.OK).send(renewals);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the renewals Process on userID ${req.params.userId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the renewals Processes on userID', details: error });
  }
});

const getRenewalsById = catchAsync(async (req, res) => {
  try {
    const renewals = await renewalsService.getRenewalsById(req.params.renewalsId);
    if (!renewals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all renewals Processes on ID');
    }
    const logString = logger.info(`${req.userName} Accessed all the Renewals Process Data on ID ${req.params.renewalsId}`)
      .transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(httpStatus.OK).send(renewals);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Renewals Process on userID ${req.params.renewalsId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the renewals Processes on userID', details: error });
  }
});

const updateRenewalsOnId = catchAsync(async (req, res) => {
  try {
    const existingRenewalsbyID = await renewalsService.getRenewalsById(req.params.renewalsId);
    const updatedRenewals = await renewalsService.updateRenewalsOnId(req.params.renewalsId, req.body);
    const updatedBy = await renewalsService.updateUpdatedBy(req.params.renewalsId, req.userId);
    const updatedFields = diff(existingRenewalsbyID.toJSON(), updatedRenewals.toJSON());
    const logMessage = logRenewalsUpdates(req.userId, existingRenewalsbyID, updatedRenewals, updatedFields);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.renewalsId,
      'renewals',
      existingRenewalsbyID,
      updatedRenewals,
      updatedFields,
      logMessage
    );
    if (!updatedRenewals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update renewals Process');
    }
    const logString = logger.info(`${req.userName} Updated renewals Process with ID ${req.params.renewalsId}`).transports[0]
      .logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(httpStatus.OK).send(updatedRenewals);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update renewals Process with ID ${req.params.renewalsId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(400).json({ message: 'Failed to update renewals Process. Please Check the Input', details: error });
  }
});

function logRenewalsUpdates(userId, oldDoc, updatedRenewals, updatedFields) {
  const logMsg = `User ${userId} updated renewals Process ${updatedRenewals._id}\nFields:`;
  const fieldUpdates = [];
  for (const field in updatedFields) {
    fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedRenewals[field]}`);
  }
  return `${logMsg}\n${fieldUpdates.join('\n')}`;
}

const renewalsProcessFlowForward = catchAsync(async (req, res) => {
  try {
    const renewals = await renewalsService.renewalsProcessFlowForward(req.body, req.params.renewalsId, req.userId);
    if (!renewals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update the Renewals Process');
    }
    const updatedBy = await renewalsService.updateUpdatedBy(req.params.renewalsId, req.userId);
    const logString = logger.info(`${req.userName} Updated the Renewals Process from one Stage to next (Moved Forward)`)
      .transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(httpStatus.OK).send(renewals);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Renewals Process from one Stage to next (Move Forward), encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res
      .status(400)
      .json({ message: 'Failed to Update Renewals Process from one Stage to next (Move Forward)', details: error });
  }
});

const getRenewalStatusCount = catchAsync(async (req, res) => {
  try {
    const renewals = await renewalsService.getRenewalStatusCount(req.body, req.query);
    const logString = logger.info(`${req.userName} Renewal Status Count`).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(httpStatus.OK).send(renewals);
  } catch (error) {
    console.log(error);
    const logString = logger.error(`${req.userName} Unable to get Renewal Status Count`).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(400).json({ message: 'Unable to get Renewal Status Count' });
  }
});

const renewalsProcessBackward = catchAsync(async (req, res) => {
  try {
    const renewals = await renewalsService.renewalsProcessBackward(req.params.renewalsId);
    if (!renewals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update the Renewals Process');
    }
    const updatedBy = await renewalsService.updateUpdatedBy(req.params.renewalsId, req.userId);
    const logString = logger.info(`${req.userName} Updated the Renewals Process from one Stage to other (Moved Backward)`)
      .transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(httpStatus.OK).json(renewals);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Renewals Process from one Stage to other (Move Backward), encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res
      .status(400)
      .json({ message: 'Failed to Update Renewals Process from one Stage to other (Move Backward)', details: error });
  }
});

const getAllRenewals = catchAsync(async (req, res) => {
  try {
    console.log(req.query);
    const renewals = await renewalsService.AllRenewals(req.params.type, req.query.page, req.query.perPage, req.query.Search, req.body);
    if (!renewals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the Renewals');
    }
    const logString = logger.info(`${req.user} try to fetch All renewals`).transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(httpStatus.OK).send(renewals);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to get All Renewals, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('renewals', req.userId, logString);
    res.status(400).json({ message: 'Failed to get All Renewals ', details: error });
  }
});

const renewalsEmployeeDetails = catchAsync(async (req, res) => {
  try {
    console.log(req.params.renewalsId);
    const renewals = await renewalsService.getRenewalsEmployeeDetails(req.params.renewalsId);
    console.log(renewals);
    if (!renewals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the Renewals');
    }
    res.status(httpStatus.OK).send(renewals);
  } catch (error) {
    res.status(400).json({ message: 'Failed to get All Renewals ', details: error });
  }
});

const clearRenewalsTable = catchAsync(async (req,res) => {
  try {
    const renewals = await renewalsService.clearRenewalsTable();
    if (!renewals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to clear the Renewals table');
    }
    res.status(httpStatus.OK).send(renewals);
  } catch(error){
    throw new Error(error)
  }
})

module.exports = {
  createRenewals,
  listAllRenewals,
  getRenewalsById,
  getRenewalsOnUserId,
  updateRenewalsOnId,
  renewalsProcessFlowForward,
  renewalsProcessBackward,
  getRenewalStatusCount,
  getAllRenewals,
  renewalsEmployeeDetails,
  clearRenewalsTable,
};
