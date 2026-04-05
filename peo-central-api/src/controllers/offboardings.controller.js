const httpStatus = require('http-status');
const { offboardingsService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { activityService } = require('../services');
const logger = require('../middlewares/logger');
const { Users, Onboardings } = require('../models');
const { loggerService } = require('../services');
const { diff } = require('deep-object-diff');
const { Processes } = require('../models');
const { documentTemplateService } = require('../services');
const { documentTemplateCloneService } = require('../services');
const { ObjectId } = require('mongodb');
const { DocumentTemplatesClone } = require('../models');
const moment = require('moment-timezone');

// const createOffboardingsOne = catchAsync(async (req, res) => {
//   try {
//     let docCloneIds = [];
//     let employment_type = req.body.employment_type;
//     let processArray = [];

//     if (employment_type == 'Employment Visa (2-Year)') {
//       processArray = await Processes.find({ process_name: 'offboarding' });
//     } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
//       processArray = await Processes.find({ process_name: 'mission visa offboarding' }); 
//     } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
//       processArray = await Processes.find({ process_name: 'work permit offboarding' });
//     }
//     let offboardingBody = {
//       user_id: req.body.user_id,
//       company_id: req.body.company_id,
//       process_type: req.body.process_type,
//       attachments: req.body.attachments,
//       comments: req.body.comments,
//       status: 'resignation received',
//       last_working_day: req.body.last_working_day,
//       exit_reason: req.body.exit_reason,
//       salary_payable: req.body.salary_payable,
//       leave_encashment: req.body.leave_encashment,
//       gratuity: req.body.gratuity,
//       processes: [],
//     };
//     // const documents = await Promise.all(
//     //   processArray[0].stages.map(async (process) => {
//     //     const documentActions = await Promise.all(
//     //       process.actions.map(async (action) => {
//     //         if (action.action_type === 'document') {
//     //           const document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
//     //           const template = document_template;
//     //           template.auto_replace_keys.forEach((replaceKeys) => {
//     //             replaceKeys.fk_id = '';
//     //           });
//     //           let templateBody = {
//     //             auto_replace_keys: template.auto_replace_keys,
//     //             user_input_keys: template.user_input_keys,
//     //             name: template.name,
//     //             content: template.content,
//     //             module: template.module,
//     //           };
//     //           const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
//     //             templateBody
//     //           );
//     //           action.template_id = create_document_template_clone._id;
//     //           offboardingBody.processes = processArray[0].stages;
//     //           docCloneIds.push({ _id: create_document_template_clone._id });
//     //           return true;
//     //         }
//     //         return false;
//     //       })
//     //     );
//     //     if (documentActions.some(Boolean)) {
//     //       return process;
//     //     }
//     //   })
//     // );
//     const documents = await Promise.all(
//       processArray[0].stages.map(async (process) => {
//         const documentActions = await Promise.all(
//           process.actions.map(async (action) => {
//             if (action.action_type === 'document') {
//               const document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
//               const template = document_template;
//               template.auto_replace_keys.forEach((replaceKeys) => {
//                 replaceKeys.fk_id = '';
//               });
//               let templateBody = {
//                 auto_replace_keys: template.auto_replace_keys,
//                 user_input_keys: template.user_input_keys,
//                 name: template.name,
//                 content: template.content,
//                 module: template.module,
//               };
//               const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
//                 templateBody
//               );
//               action.template_id = create_document_template_clone._id;
//               docCloneIds.push({ _id: create_document_template_clone._id });
//             }
//             // push processes that are different
//             offboardingBody.processes.push(process);
//             return true;
//           })
//         );
//         // Push the process to offboardingBody if it has any actions or criteria you want
//         if (documentActions.some(Boolean)) {
//           return process;
//         }
//       })
//     );
//     const userStatusUpdate = await Users.findOneAndUpdate(
//       { _id: ObjectId(req.body.user_id) },
//       { $set: { user_status: 'offboarding' } },
//       { new: true }
//     );
//     const offboarding = await offboardingsService.createOffboardings(offboardingBody);
//     const created_by = await offboardingsService.updateCreatedBy(offboarding._id, req.userId);
//     const logMessage = logOffboardingProcessCreation(req.userId, offboarding);
//     const addActivityLog = await activityService.createActivity(
//       req.userId,
//       offboarding._id,
//       'offboarding',
//       {},
//       offboarding,
//       {},
//       logMessage
//     );
//     const logString = logger.info(`${req.userName} Created an offboarding Process with ID ${offboarding._id}`).transports[0]
//       .logString;
//     await loggerService.createLogger('offboarding', req.userId, logString);
//     await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: offboarding._id } });
//     res.status(httpStatus.CREATED).send(offboarding);
//   } catch (error) {
//     const logString = logger.error(
//       `${req.userName} Failed to Create offboarding Process, encountered the following error => ${error}`
//     ).transports[0].logString;
//     await loggerService.createLogger('offboarding', req.userId, logString);
//     res.status(400).json({ message: 'Failed to create offboarding Process. Please Check the Input', details: error });
//   }
// });

const createOffboardings = catchAsync(async (req, res) => {
  try {
    let docCloneIds = [];
    let employment_type = req.body.employment_type;
    let processArray = [];

    if (employment_type == 'Employment Visa (2-Year)') {
      processArray = await Processes.find({ process_name: 'offboarding' });
    } else if (employment_type == 'Mission Visa (3 Months Single Entry)') {
      processArray = await Processes.find({ process_name: 'mission visa offboarding' }); 
    } else if (employment_type == 'Work Permit (for UAE Resident visa holders)') {
      processArray = await Processes.find({ process_name: 'work permit offboarding' });
    }

    let offboardingBody = {
      user_id: req.body.user_id,
      company_id: req.body.company_id,
      process_type: req.body.process_type,
      attachments: req.body.attachments,
      comments: req.body.comments,
      status: 'resignation received',
      last_working_day: req.body.last_working_day,
      exit_reason: req.body.exit_reason,
      salary_payable: req.body.salary_payable,
      leave_encashment: req.body.leave_encashment,
      gratuity: req.body.gratuity,
      processes: [],
    };
    const assignedPro = await Onboardings.findOne({ user_id: ObjectId(req.body.user_id) });
    if (assignedPro) {
      offboardingBody.assigned_pro = assignedPro._id;
    }
    // await Promise.all(
    //   processArray[0].stages.map(async (process) => {
    //     const updatedProcess = { ...process };
    //     updatedProcess.actions = await Promise.all(
    //       process.actions.map(async (action) => {
    //         if (action.action_type === 'document') {
    //           const document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
    //           console.log(document_template)
    //           const template = { ...document_template };
    //           template.auto_replace_keys.forEach((replaceKeys) => {
    //             replaceKeys.fk_id = '';
    //           });
    //           let templateBody = {
    //             auto_replace_keys: template.auto_replace_keys,
    //             user_input_keys: template.user_input_keys,
    //             name: template.name,
    //             content: template.content,
    //             module: template.module,
    //           };
    //           const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
    //             templateBody
    //           );
    //           action.template_id = create_document_template_clone._id;
    //           docCloneIds.push({ _id: create_document_template_clone._id });
    //         }
    //         return action;
    //       })
    //     );
    //     offboardingBody.processes.push(updatedProcess);
    //   })
    // );

    for (const process of processArray[0].stages) {
      const updatedProcess = { ...process };
      updatedProcess.actions = [];
    
      for (const action of process.actions) {
        let updatedAction = { ...action };
    
        if (action.action_type === 'document') {
          const document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
          if (document_template && document_template.auto_replace_keys) {
            const template = {
              ...document_template._doc, // ensure to use ._doc here
              auto_replace_keys: document_template.auto_replace_keys.map(replaceKey => ({
                ...replaceKey,
                fk_id: ''
              }))
            };
            let templateBody = {
              auto_replace_keys: template.auto_replace_keys,
              user_input_keys: template.user_input_keys,
              name: template.name,
              content: template.content,
              module: template.module,
            };
            const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
              templateBody
            );
            updatedAction.template_id = create_document_template_clone._id;
            docCloneIds.push({ _id: create_document_template_clone._id });
          } else {
            console.warn(`Document template or auto_replace_keys not found for action: ${action._id}`);
          }
        }
    
        updatedProcess.actions.push(updatedAction);
      }
    
      offboardingBody.processes.push(updatedProcess);
    }

    /**
     * The following block of code was grayed out for the following reason
     * it was making use of a map inside a loop which is unpredictable
     * The one currently in use users for loop instead
     */
    // await Promise.all(
    //   processArray[0].stages.map(async (process) => {
    //     const updatedProcess = { ...process };
    //     updatedProcess.actions = await Promise.all(
    //       process.actions.map(async (action) => {
    //         if (action.action_type === 'document') {
    //           console.log('--------------->action type is document---------------------->')
    //           const document_template = await documentTemplateService.getDocTemplatesOnID(action.template_id);
    //           console.log(action.template_id, '--------->this is the id from mongo---------->')
    //           console.log('this is the module from doc template----->',document_template.module, 'end module from temp-------->');
    //           console.log('1111111111--------->',document_template, 'this is the found template we are looking for')
    //           if (document_template && document_template.auto_replace_keys) {
    //             const template = {
    //               ...document_template,
    //               auto_replace_keys: document_template.auto_replace_keys.map(replaceKey => ({
    //                 ...replaceKey,
    //                 fk_id: ''
    //               }))
    //             };
    
    //             let templateBody = {
    //               auto_replace_keys: template.auto_replace_keys,
    //               user_input_keys: template.user_input_keys,
    //               name: template.name,
    //               content: template.content,
    //               module: template.module,
    //             };
    //             console.log('this is the template body to create', templateBody, '--------------->');
    //             console.log("begining process to create clone---------------->");
    //             console.log(template.name, 'the name from doc template');
    //             console.log(template.module, 'the module from temp');
    //             console.log(template.user_input_keys, 'the user_input_keys');
               
    //             const create_document_template_clone = await documentTemplateCloneService.createDocumentTemplateClone(
    //               templateBody
    //             );
    //             console.log(create_document_template_clone, '-------->is the id for the new clone---------->')
    //             action.template_id = create_document_template_clone._id;
    //             docCloneIds.push({ _id: create_document_template_clone._id });
    //           } else {
    //             console.warn(`Document template or auto_replace_keys not found for action: ${action._id}`);
    //           }
    //         }
    //         return action;
    //       })
    //     );
    //     offboardingBody.processes.push(updatedProcess);
    //   })
    // );

    let offboardedUser = await Users.findOne({ _id: ObjectId(req.body.user_id) });
    if(!offboardedUser) throw new Error('User not found! Please try again');
    offboardedUser.user_status = 'offboarding';
    if(req.body.date_of_joining){
      offboardedUser.date_of_joining = req.body.date_of_joining;
      offboardedUser.employment.date_of_joining = req.body.date_of_joining;
    }
    await offboardedUser.save();

    // const userStatusUpdate = await Users.findOneAndUpdate(
    //   { _id: ObjectId(req.body.user_id) },
    //   { $set: { user_status: 'offboarding' } },
    //   { new: true }
    // );

    const offboarding = await offboardingsService.createOffboardings(offboardingBody);
    const created_by = await offboardingsService.updateCreatedBy(offboarding._id, req.userId);
    const logMessage = logOffboardingProcessCreation(req.userId, offboarding);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      offboarding._id,
      'offboarding',
      {},
      offboarding,
      {},
      logMessage
    );
    const logString = logger.info(`${req.userName} Created an offboarding Process with ID ${offboarding._id}`).transports[0]
      .logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    await DocumentTemplatesClone.updateMany({ _id: { $in: docCloneIds } }, { $set: { module_id: offboarding._id } });
    res.status(httpStatus.CREATED).send(offboarding);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Create offboarding Process, encountered the following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(400).json({ message: 'Failed to create offboarding Process. Please Check the Input', details: error });
  }
});

function logOffboardingProcessCreation(userId, offboarding) {
  const logMsg = `User ${userId} Created offboarding Process ${offboarding._id}`;
  return logMsg;
}

const listAllOffboardings = catchAsync(async (req, res) => {
  try {
    const offboarding = await offboardingsService.listAllOffboardings(req.query);
    if (!offboarding) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all offboarding Processes');
    }
    const logString = logger.info(`${req.userName} Accessed all the offboarding Process Data`).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(httpStatus.OK).send(offboarding);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the offboarding Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the offboarding Processes', details: error });
  }
});

const getOffboardingsOnUserId = catchAsync(async (req, res) => {
  try {
    const offboarding = await offboardingsService.getOffboardingsOnUserId(req.params.userId);
    if (!offboarding) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all offboarding Processes on UserID');
    }
    const logString = logger.info(`${req.userName} Accessed all the offboarding Process Data on userID ${req.params.userId}`)
      .transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(httpStatus.OK).send(offboarding);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the offboarding Process on userID ${req.params.userId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the offboarding Processes on userID', details: error });
  }
});

const getOffboardingsById = catchAsync(async (req, res) => {
  try {
    const offboarding = await offboardingsService.getOffboardingsById(req.params.offboardingId);
    if (!offboarding) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all offboarding Processes on ID');
    }
    const logString = logger.info(
      `${req.userName} Accessed all the offboarding Process Data on ID ${req.params.offboardingId}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(httpStatus.OK).send(offboarding);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the offboarding Process on ID ${req.params.offboardingId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the offboarding Processes on ID', details: error });
  }
});

const getOffboardingDataOnID = catchAsync(async (req, res) => {
  try {
    const offboarding = await offboardingsService.getOffboardingDataOnID(req.params.offboardingId, req.body);
    if (!offboarding) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all offboarding on ID');
    }
    const logString = logger.info(`${req.userName} Accessed all the offboarding Data on ID ${req.params.offboardingId}`)
      .transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(httpStatus.OK).send(offboarding);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the offboarding on ID ${req.params.offboardingId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the offboarding on ID', details: error });
  }
});

const updateOffboardingsOnId = catchAsync(async (req, res) => {
  try {
    const existingOffboardingsProcesssbyID = await offboardingsService.getOffboardingsById(req.params.offboardingId);
    const updatedOffboardingProcesss = await offboardingsService.updateOffboardingsOnId(req.params.offboardingId, req.body);
    const updatedBy = await offboardingsService.updateUpdatedBy(req.params.offboardingId, req.userId);
    const updatedFields = diff(existingOffboardingsProcesssbyID.toJSON(), updatedOffboardingProcesss.toJSON());
    const logMessage = logOffboardingsProcessUpdates(
      req.userId,
      existingOffboardingsProcesssbyID,
      updatedOffboardingProcesss,
      updatedFields
    );
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.offboardingId,
      'offboarding',
      existingOffboardingsProcesssbyID,
      updatedOffboardingProcesss,
      updatedFields,
      logMessage
    );
    if (!updatedOffboardingProcesss) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update offboarding Process');
    }
    const logString = logger.info(`${req.userName} Updated offboarding Process with ID ${req.params.offboardingId}`)
      .transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(httpStatus.OK).send(updatedOffboardingProcesss);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update offboarding Process with ID ${req.params.offboardingId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(400).json({ message: 'Failed to update offboarding Process. Please Check the Input', details: error });
  }
});

function logOffboardingsProcessUpdates(userId, oldDoc, updatedOffboardingProcesss, updatedFields) {
  const logMsg = `User ${userId} updated offboarding Process ${updatedOffboardingProcesss._id}\nFields:`;
  const fieldUpdates = [];
  for (const field in updatedFields) {
    fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedOffboardingProcesss[field]}`);
  }
  return `${logMsg}\n${fieldUpdates.join('\n')}`;
}

const offboardingProcessFlowForward = catchAsync(async (req, res) => {
  try {
    const offboarding = await offboardingsService.offboardingProcessFlowForward(
      req.body,
      req.params.offboardingId,
      req.userId
    );
    if (!offboarding) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update the offboarding Process');
    }
    const updatedBy = await offboardingsService.updateUpdatedBy(req.params.offboardingId, req.userId);
    const logString = logger.info(`${req.userName} Updated the offboarding Process from one Stage to next (Moved Forward)`)
      .transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(httpStatus.OK).send(offboarding);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update offboarding Process from one Stage to next (Move Forward), encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res
      .status(400)
      .json({ message: 'Failed to Update offboarding Process from one Stage to next (Move Forward)', details: error });
  }
});

const offboardingProcessFlowBackward = catchAsync(async (req, res) => {
  try {
    const offboarding = await offboardingsService.offboardingProcessFlowBackward(req.params.offboardingId);
    if (!offboarding) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update the offboarding Renewal Process Backward');
    }
    const updatedBy = await offboardingsService.updateUpdatedBy(req.params.offboardingId, req.userId);
    const logString = logger.info(
      `${req.userName} Updated the offboarding Renewal Process from one Stage to other (Moved Backward)`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(httpStatus.OK).send(offboarding);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update offboarding Renewal Process from one Stage to other (Move Backward), encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(400).json({
      message: 'Failed to Update offboarding Renewal Process from one Stage to other (Move Backward)',
      details: error,
    });
  }
});

const getOffBoardings = catchAsync(async (req, res) => {
  try {
    const offboarding = await offboardingsService.getOffBoardingFilter(req.query);
    if (!offboarding) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch the offboarding data');
    }
    const updatedBy = await offboardingsService.updateUpdatedBy(req.params.offboardingId, req.userId);
    const logString = logger.info(`${req.userName} Unable to fetch the offboarding data`).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(httpStatus.OK).send(offboarding);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Unable to fetch the offboarding data, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboarding', req.userId, logString);
    res.status(400).json({ message: 'Unable to fetch the offboarding data', details: error });
  }
});

const offboardingPipeline = catchAsync(async (req, res) => {
  try {
    const offboardings = await offboardingsService.getOffBoardingPipeline();
    if (!offboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the Offboardings Pipeline');
    }
    const logString = logger.info(`${req.userName} Fetched all the Offboardings Data on Status PipeLineAPI`).transports[0]
      .logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(httpStatus.OK).send(offboardings);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Fetch all the Offboardings Data on Status PipeLineAPI, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch all the Offboardings Data on Status PipeLineAPI', details: error });
  }
});

const getOffboardingStatusCount = catchAsync(async (req, res) => {
  try {
    const offboardings = await offboardingsService.getOffboardingStatusCount(req.body);
    const logString = logger.info(`${req.userName} Offboarding Status Count`).transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(httpStatus.OK).send(offboardings);
  } catch (error) {
    console.log(error);
    const logString = logger.error(`${req.userName} Unable to get Offboarding Status Count`).transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(400).json({ message: 'Unable to get Offboarding Status Count' });
  }
});

const getPipelineList = catchAsync(async (req, res) => {
  try {
    const offboardings = await offboardingsService.getDiffPipelineList(req.query, req.query.page, req.query.limit);
    if (!offboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the Offboardings Pipeline');
    }
    const logString = logger.info(`${req.userName} Fetched all the Offboardings Data on Status PipeLineAPI`).transports[0]
      .logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(httpStatus.OK).send(offboardings);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Failed to Fetch all the Offboardings Data on Status PipeLineAPI, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch all the Offboardings Data on Status PipeLineAPI', details: error });
  }
});

const listOfOffboardingStatus = catchAsync(async (req, res) => {
  try {
    const result = await offboardingsService.listOfOffboardingStatus(req.query, req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Status');
    }
    const logString = logger.info(`${req.userName} Accesses the list of Status of Offboardings `).transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Status of Offboardings, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Status of Offboardings ', details: error });
  }
});

const extendedListOfUsersAndCompanies = catchAsync(async (req, res) => {
  try {
    const offboardings = await offboardingsService.extendedListOfUsersAndCompanies(req.params.offboardingId);
    if (!offboardings) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch Employee Details for the given ID');
    }
    const logString = logger.info(
      `${req.userName} Accessed Employee Details for the given Offboarding ID ${req.params.offboardingId}`
    ).transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(httpStatus.OK).send(offboardings);
  } catch (error) {
    console.log(error, "------------------------>")
    const logString = logger.error(
      `${req.userName} Failed to Access Employee Details for the given Offboarding ID ${req.params.offboardingId}`
    ).transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to Access Employee Details for the given Offboarding ID' });
  }
});

const getDashboardCount = catchAsync(async (req, res) => {
  try {
    const result = await offboardingsService.getApplicationDistribution();
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

const removeEmployeeFromOffBoarding = catchAsync(async (req, res) => {
  try {
    const offboarding = await offboardingsService.removeUserFromOffBoarding(req.params.userId, req.params.offBoardingId);
    if (!offboarding) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the Offboardings Pipeline');
    }
    const logString = logger.info(`${req.userName} Removing employee from offborading on userId and offBoardingId`)
      .transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(httpStatus.OK).send(offboarding);
  } catch (error) {
    console.log(error);
    const logString = logger.error(
      `${req.userName} Failed to remove employee from offboarding, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('offboardings', req.userId, logString);
    res.status(400).json({ message: 'Failed to remove user from offboradings ', details: error });
  }
});

module.exports = {
  getOffboardingStatusCount,
  offboardingPipeline,
  getPipelineList,
  getOffBoardings,
  createOffboardings,
  listAllOffboardings,
  getOffboardingsOnUserId,
  getOffboardingsById,
  updateOffboardingsOnId,
  offboardingProcessFlowForward,
  offboardingProcessFlowBackward,
  getOffboardingDataOnID,
  listOfOffboardingStatus,
  extendedListOfUsersAndCompanies,
  getDashboardCount,
  removeEmployeeFromOffBoarding,
};
