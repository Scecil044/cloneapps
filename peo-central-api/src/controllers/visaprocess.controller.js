const httpStatus = require('http-status');
const { visaProcessService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { activityService, processesService } = require('../services');
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require('../services');
const { diff } = require('deep-object-diff');

const createVisaProcess = catchAsync(async (req, res) => {
  try {
    const visa = await visaProcessService.createVisaProcess(req.body);
    const created_by = await visaProcessService.updateCreatedBy(visa._id, req.userId);
    const logMessage = logVisaProcessCreation(req.userId, visa);
    const addActivityLog = await activityService.createActivity(req.userId, visa._id, 'visa', {}, visa, {}, logMessage);
    const logString = logger.info(`${req.userName} Created a Visa Process with ID ${visa._id}`).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.CREATED).send(visa);
  } catch (error) {
    const logString = logger.error(`${req.userName} Failed to Create Visa Process, encountered following error => ${error}`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to create Visa Process. Please Check the Input', details: error });
  }
});

function logVisaProcessCreation(userId, visa) {
  const logMsg = `User ${userId} Created Visa Process ${visa._id}`;
  return logMsg;
}

const listAllVisaProcess = catchAsync(async (req, res) => {
  try {
    const visa = await visaProcessService.listAllVisaProcess();
    if (!visa) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Visa Processes');
    }
    const logString = logger.info(`${req.userName} Accessed all the Visa Process Data`).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(visa);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Visa Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the Visa Processes', details: error });
  }
});

const getVisaProcessOnUserId = catchAsync(async (req, res) => {
  try {
    const visa = await visaProcessService.getVisaProcessOnUserId(req.params.userId);
    if (!visa) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Visa Processes on UserID');
    }
    const logString = logger.info(`${req.userName} Accessed all the Visa Process Data on userID ${req.params.userId}`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(visa);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Visa Process on userID ${req.params.userId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the Visa Processes on userID', details: error });
  }
});

const getVisaProcessById = catchAsync(async (req, res) => {
  try {
    const visa = await visaProcessService.getVisaProcessById(req.params.visaId);
    if (!visa) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all Visa Processes on ID');
    }
    const logString = logger.info(`${req.userName} Accessed all the Visa Process Data on ID ${req.params.visaId}`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(visa);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access All the Visa Process on ID ${req.params.visaId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to fetch all the Visa Processes on ID', details: error });
  }
});

const updateVisaProcessOnId = catchAsync(async (req, res) => {
  try {
    const existingVisaProcesssbyID = await visaProcessService.getVisaProcessById(req.params.visaId);
    const updatedVisaProcesss = await visaProcessService.updateVisaProcessOnId(req.params.visaId, req.body);
    const updatedBy = await visaProcessService.updateUpdatedBy(req.params.visaId, req.userId);
    const updatedFields = diff(existingVisaProcesssbyID.toJSON(), updatedVisaProcesss.toJSON());
    const logMessage = logVisaProcessUpdates(req.userId, existingVisaProcesssbyID, updatedVisaProcesss, updatedFields);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.visaId,
      'visa',
      existingVisaProcesssbyID,
      updatedVisaProcesss,
      updatedFields,
      logMessage
    );
    if (!updatedVisaProcesss) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update Visa Process');
    }
    const logString = logger.info(`${req.userName} Updated Visa Process with ID ${req.params.visaId}`).transports[0]
      .logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(updatedVisaProcesss);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Visa Process with ID ${req.params.visaId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to update Visa Process. Please Check the Input', details: error });
  }
});

function logVisaProcessUpdates(userId, oldDoc, updatedVisaProcesss, updatedFields) {
  const logMsg = `User ${userId} updated Visa Process ${updatedVisaProcesss._id}\nFields:`;
  const fieldUpdates = [];
  for (const field in updatedFields) {
    fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedVisaProcesss[field]}`);
  }
  return `${logMsg}\n${fieldUpdates.join('\n')}`;
}

const visaProcessFlowForward = catchAsync(async (req, res) => {
  try {
    const visa = await visaProcessService.visaProcessFlowForward(req.body, req.params.visaId, req.userId);
    if (!visa) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update the Visa Process');
    }
    const updatedBy = await visaProcessService.updateUpdatedBy(req.params.visaId, req.userId);
    const logString = logger.info(`${req.userName} Updated the Visa Process from one Stage to next (Moved Forward)`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(visa);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Visa Process from one Stage to next (Move Forward), encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to Update Visa Process from one Stage to next (Move Forward)', details: error });
  }
});

const visaProcessFlowCompleteStep = catchAsync(async (req, res) => {
  try {
    console.log('===========waiting response');
    const visa = await visaProcessService.visaProcessFlowCompleteStep(req.body, req.params.visaId, req.userId);
    if (!visa) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update the Visa Process');
    }
    const updatedBy = await visaProcessService.updateUpdatedBy(req.params.visaId, req.userId);
    const logString = logger.info(`${req.userName} Updated the Visa Process from one Stage to next (Moved Forward)`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(visa);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Visa Process from one Stage to next (Move Forward), encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to Update Visa Process from one Stage to next (Move Forward)', details: error });
  }
});

const visaRenewalProcessFlowBackward = catchAsync(async (req, res) => {
  try {
    const visa = await visaProcessService.visaRenewalProcessFlowBackward(req.params.visaId);
    if (!visa) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to Update the Visa Renewal Process Backward');
    }
    const updatedBy = await visaProcessService.updateUpdatedBy(req.params.visaId, req.userId);
    const logString = logger.info(
      `${req.userName} Updated the Visa Renewal Process from one Stage to other (Moved Backward)`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(visa);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Update Visa Renewal Process from one Stage to other (Move Backward), encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res
      .status(400)
      .json({ message: 'Failed to Update Visa Renewal Process from one Stage to other (Move Backward)', details: error });
  }
});

const getVisaProcessPipelineCount = catchAsync(async (req, res) => {
  try {
    const visa = await visaProcessService.getVisaProcessPipelineCount();
    if (!visa) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the visa Pipeline');
    }
    const logString = logger.info(`${req.userName} Fetched all the visa Data on Status PipeLineAPI`).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(visa);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Fetch all the visa Data on Status PipeLineAPI, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch all the visa Data on Status PipeLineAPI', details: error });
  }
});

const getVisaDiffPipelineList = catchAsync(async (req, res) => {
  try {
    const visa = await visaProcessService.getVisaDiffPipelineList(req.query, req.query.page, req.query.limit);
    if (!visa) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch the visa Pipeline');
    }
    const logString = logger.info(`${req.userName} Fetched all the visa Data on Status PipeLineAPI`).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(visa);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Fetch all the visa Data on Status PipeLineAPI, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to Fetch all the visa Data on Status PipeLineAPI', details: error });
  }
});

const listOfVisaProcessStatus = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.listOfVisaProcessStatus(req.query, req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the Status');
    }
    const logString = logger.info(`${req.userName} Accesses the list of Status of Visa Process `).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Status of Visa Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the Status of Visa Process ', details: error });
  }
});

const listOnProcessStatus = catchAsync(async (req, res) => {
  try {
   if (req.body.stage_name === 'medical tests application') {
      req.body.stage_name = 'medical test application'; // use = for assignment
    }

// console.log('===========waiting response', req.body.stage_name);

    console.log('===========waiting response', req.body.stage_name);
    const result = await visaProcessService.listOnProcessStatus(
      req.body.section_name,
      req.body.stage_name,
      req.query,
      req.body
    );
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot get the list');
    }
    const logString = logger.info(`${req.userName} Accesses the list of Visa Process `).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the list of Visa Process, encountered following error => ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the list of Visa Process ', details: error?.message });
  }
});

const createVisaRenewals = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.createVisaRenewals(req.body, req.userId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot create a Visa Renewal Process');
    }
    const created_by = await visaProcessService.updateCreatedBy(result.created_by, req.userId);
    const logString = logger.info(`${req.userName} Created a Visa Renewal Process `).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to create a Visa Renewal Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to create a Visa Renewal Process ', details: error });
  }
});

const createVisaCancellation = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.createVisaCancellation(req.body, req.userId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot create a Visa Cancellation Process');
    }
    const created_by = await visaProcessService.updateCreatedBy(result.created_by, req.userId);
    const logString = logger.info(`${req.userName} Created a Visa Cancellation Process `).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to create a Visa Cancellation Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to create a Visa Cancellation Process ', details: error });
  }
});

const createNewVisa = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.createNewVisa(req.body, req.userId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot create a new Visa Process');
    }
    const created_by = await visaProcessService.updateCreatedBy(result.created_by, req.userId);
    const logString = logger.info(`${req.userName} Created a new Visa Process `).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to create a new Visa Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to create a new Visa Process ', details: error });
  }
});

const createProcessVisa = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.createProcessVisa(req.body, req.userId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot create a Visa Process');
    }
    const created_by = await visaProcessService.updateCreatedBy(result.created_by, req.userId);
    const logString = logger.info(`${req.userName} Created a Visa Process `).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to create a Visa Process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to create a Visa Process ', details: error });
  }
});

const visaProcessPipelineListAndCount = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.visaProcessPipelineListAndCount(req.body.process_name);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the pipeline Data');
    }
    const created_by = await visaProcessService.updateCreatedBy(result.created_by, req.userId);
    const logString = logger.info(`${req.userName} Fetched the Pipeline List of new Visa Process with their Counts`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Pipeline List and Counts, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failes to get the Pipeline list', details: error });
  }
});

const findByProcess = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.findByProcess(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get the pipeline Data');
    }
    const created_by = await visaProcessService.updateCreatedBy(result.created_by, req.userId);
    const logString = logger.info(`${req.userName} Fetched the Pipeline List of new Visa Process with their Counts`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Pipeline List and Counts, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failes to get the Pipeline list', details: error });
  }
});

const Distribution = catchAsync(async (req, res) => {
  try {
    const applicationDistribution = await visaProcessService.ApplicationDistribution(req.body);
    const logString = logger.info(`${req.userName} Fetched the Pipeline List of new Visa Process with their Counts`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(applicationDistribution);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to get the Pipeline List and Counts, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failes to get the Pipeline list', details: error });
  }
});

/**
 * This function adds comments to visaProcesses
 * Its implementation sends email notifications to all mentioned users
 */
const commentOnVisaProcessDoc = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.addCommentstoVisaProcessDoc(req.params.visaId, req.body, req.userId);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to add comment to visa process doc, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to comment on visa process doc', details: error });
  }
});
/**
 * This function adds comments to specific process on visaProcesses doc
 * Its implementation sends email notifications to all mentioned users
 */
const commentOnVisaProcess = catchAsync(async (req, res) => {
  try{
    const visaProcess = await visaProcessService.addCommentToVisaProcess(
      req.params.visaId,
      req.body,
      req.userId,
      req.params.processId
    );
    if (!visaProcess) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update visa process comments on visaID');
    }
    const logString = logger.info(`${req.userName} Accessed all the Visa Process Data on userID ${req.params.userId}`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(visaProcess);
  } catch(error){
    console.log(error);
    throw new Error(error);
  }
});

const markCommentsAsRead = catchAsync(async(req, res)=>{
  try{
    const response = await visaProcessService.markCommentsAsRead(req.params.visaId,req.userId,req.params.processId);
    const logString = logger.info(`${req.userName} marked all comments as read`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(response);
  }catch(error){
    const logString = logger.error(
      `${req.userName} Failed to mark all comments as read for visa id ${req.params.visaId}, on process with id ${req.params.processId}=> ${error?.message}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(500).json({ message: 'An error occurred while marking comments as read. Please try again later.' });
  }
});

const updateCommentInVisaProcess = catchAsync(async (req, res)=> {
  try{
    const response = await visaProcessService.updateCommentInVisaProcess(req.params.visaId,req.params.processId, req.params.commentId, req.userId, req.body);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update comment from visa process');
    }
    const logString = logger.info(`${req.userName} Accessed update comment from visa process ${req.params.visaId}`)
    .transports[0].logString;
  await loggerService.createLogger('visa', req.userId, logString);
  res.status(httpStatus.OK).send(response);
  }catch(error){
    const logString = logger.info(`${req.userName} ${req.params.userId} Failed to update comment from visa process with id ${req.params.visaId} and process id ${req.params.processId}`)
    .transports[0].logString;
  await loggerService.createLogger('visa', req.userId, logString);
    throw new Error(error);
  }
})

const deleteCommentFromVisaProcess = catchAsync(async (req, res)=> {
  try{
    const response = await visaProcessService.deleteCommentFromVisaProcess(req.params.visaId,req.params.processId, req.params.commentId, req.userId);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete comment from visa process');
    }
    const logString = logger.info(`${req.userName} Accessed delete comment from visa process ${req.params.visaId}`)
    .transports[0].logString;
  await loggerService.createLogger('visa', req.userId, logString);
  res.status(httpStatus.OK).send(response);
  }catch(error){
    const logString = logger.info(`${req.userName} ${req.params.userId} Failed to delete comment from visa process with id ${req.params.visaId}`)
    .transports[0].logString;
  await loggerService.createLogger('visa', req.userId, logString);
    throw new Error(error);
  }
})

const getCommentsOSpecificProcess = catchAsync(async (req, res) => {
  try {
    const comments = await visaProcessService.getVisaProcessComments(req.params.visaId, req.params.processId);
    if (!comments) {
      throw new ApiError(httpStatus.BAD_REQUEST, `cannot retrieve comments from the specified visa process`);
    }
    const logString = logger.info(
      `${req.userName} Accessed all the get comments route for visa process ${req.params.visaId}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(comments);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to add comment to the specified process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to get the comments for the specified visa process', details: error });
  }
});

/*
 * function to clear comments on visa process doc
 */
const clearVisaProcessComments = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.clearVisaProcessDocComments(req.params.visaId);
    const logString = logger.info(
      `${req.userName} Accessed all the clear comments route for visa process document ${req.params.visaId}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to clear comments on visa process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to clear comments on visa process doc', details: error });
  }
});

/*
 * function to clear comments on the processes array in visa process doc
 */
const clearProcessComments = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.clearCommentsOnVisaProcessByProcessId(req.params.visaId, req.params.processId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, `cannot complete process to clear comments from the specified  process`);
    }
    const logString = logger.info(`${req.userName} Accessed all the clear comments on process route ${req.params.visaId}`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to clear comments for the specified process, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to clear comments on process', details: error });
  }
});

const markAsUnsuccessful = catchAsync(async (req, res) => {
  try {
    const result = await visaProcessService.markAsUnsuccessful(req.body);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot mark visa process as unsuccessful');
    }
    const logString = logger.info(`${req.userName} Accessed the mark visa process as unsuccessful route ${req.body.visa_id}`)
      .transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to mark visa process as unsuccessful, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('visa', req.userId, logString);
    res.status(400).json({ message: 'Failed to mark as unsuccessful', details: error?.message });
  }
});

module.exports = {
  findByProcess,
  createVisaProcess,
  listAllVisaProcess,
  getVisaProcessOnUserId,
  getVisaProcessById,
  updateVisaProcessOnId,
  visaProcessFlowForward,
  visaRenewalProcessFlowBackward,
  getVisaProcessPipelineCount,
  getVisaDiffPipelineList,
  listOfVisaProcessStatus,
  listOnProcessStatus,
  createVisaRenewals,
  createVisaCancellation,
  createNewVisa,
  createProcessVisa,
  visaProcessPipelineListAndCount,
  visaProcessFlowCompleteStep,
  Distribution,
  commentOnVisaProcess,
  getCommentsOSpecificProcess,
  clearProcessComments,
  clearVisaProcessComments,
  commentOnVisaProcessDoc,
  deleteCommentFromVisaProcess,
  updateCommentInVisaProcess,
  markCommentsAsRead,
  markAsUnsuccessful
};
