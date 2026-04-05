const httpStatus = require('http-status');
const { diff } = require('deep-object-diff');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/loggers');
const pick = require('../utils/pick');
const { approvalsService, activityService, loggerService } = require('../services');

// Create a new Approval
const createApprovals = catchAsync(async (req, res) => {
  try {
    const approvals = await approvalsService.createApprovals(req.body);
    const logString = logger.info(`Created Approvals with ID ${approvals._id}`).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(200).json({ success: true, message: 'Success', approvals });
  } catch (error) {
    const logString = logger.error(`Failed to Create Approval, encountered following error => ${error}`).transports[0]
      .logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(200).json({ success: false, message: 'Failed to create approvals. Please Check the Input', error });
  }
});

// Update Approval on ID
const updateApprovalsOnID = catchAsync(async (req, res) => {
  try {
    const existingApprovalbyID = await approvalsService.getApprovalsOnId(req.params.approvalId);
    const updatedApproval = await approvalsService.updateApprovalsOnID(req.params.approvalId, req.body, req.userId);
    console.log(updatedApproval.toJSON(),"999999")
    const updatedFields = diff(existingApprovalbyID.toJSON(), updatedApproval.toJSON());
    const logMessage = logApprovalsUpdates(req.userId, existingApprovalbyID, updatedApproval, updatedFields);
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.approvalId,
      'approvals',
      existingApprovalbyID,
      updatedApproval,
      updatedFields,
      logMessage
    );
    if (!updatedApproval) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update Approvals');
    }
    const logString = logger.info(`${req.userId} Updated a Approvals with approvalId ${req.params.approvalId}`).transports[0]
      .logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', updatedApproval });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} Failed to Update Approvals with approvalId ${req.params.approvalId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(400).json({ success: false, message: 'Failed to Update Approvals. Please Check the Input', error: error });
  }
});

// Log message for Approval Updation
function logApprovalsUpdates(userId, oldDoc, updatedApproval, updatedFields) {
  const logMsg = `User ${userId} updated Approvals ${updatedApproval._id}\nFields:`;
  const fieldUpdates = [];
  for (const field in updatedFields) {
    fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedApproval[field]}`);
  }
  return `${logMsg}\n${fieldUpdates.join('\n')}`;
}

// Delete Approvals on ID
const deleteApprovalsOnId = catchAsync(async (req, res) => {
  try {
    const existingApprovalbyID = await approvalsService.getApprovalsOnId(req.params.approvalId);
    const approvals = await appr.deleteApprovalsOnId(req.params.approvalId);
    const logMessage = `User ${userId} Deleted Approval ${approvals._id}`;
    const addActivityLog = await activityService.createActivity(
      req.userId,
      req.params.approvalId,
      'approvals',
      existingApprovalbyID,
      {},
      {},
      logMessage
    );
    if (!approvals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to delete approvals');
    }
    const logString = logger.info(`${req.userId} Deleted approvals with approvalId ${req.params.approvalId}`).transports[0]
      .logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', approvals });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} Failed to Delete approvals with approvalId ${req.params.approvalId}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(400).json({ success: false, message: 'Failed to Delete approvals for the Given ID', error });
  }
});

// Get All the Approvals
const getAllApprovals = catchAsync(async (req, res) => {
  try {
    const approvals = await approvalsService.getAllApprovals();
    if (!approvals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch all approvals');
    }
    const logString = logger.info(`${req.userId} Accessed all the approvals`).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', approvals });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} Failed to Access all the approvals , encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(400).json({ success: false, message: 'Failed to Fetch All approvals', error });
  }
});

// Get the Approvals on ID
const getApprovalsOnId = catchAsync(async (req, res) => {
  try {
    const approvals = await approvalsService.getApprovalsOnId(req.params.approvalId);
    if (!approvals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch approvals');
    }
    const logString = logger.info(`${req.userId} Accessed approvals with approvalsId ${req.params.approvalsId}`)
      .transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', approvals });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} Failed to Access approvals with approvalsId ${req.params.approvalsId} , encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(400).json({ success: false, message: 'Failed to Fetch approvals for the Given ID', error });
  }
});

// Get the Approvals on User Id
const getApprovalsOnUserId = catchAsync(async (req, res) => {
  try {
    const approvals = await approvalsService.getApprovalsOnUserId(req.params.userId);
    if (!approvals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch approvals');
    }
    const logString = logger.info(`${req.userId} Accessed approvals with userId ${req.params.userId}`).transports[0]
      .logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', approvals });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} Failed to Access approvals with userId ${req.params.userId} , encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(400).json({ success: false, message: 'Failed to Fetch approvals for the Given ID', error });
  }
});

// Get the Approvals on User Id
const getApprovalsOnUserIds = catchAsync(async (req, res) => {
  try {
    const approvals = await approvalsService.getApprovalsOnUserIds(req.body.userIds);
    if (!approvals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch approvals');
    }
    const logString = logger.info(`${req.userId} Accessed approvals with userId ${req.params.userId}`).transports[0]
      .logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', approvals });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} Failed to Access approvals with userId ${req.params.userId} , encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(400).json({ success: false, message: 'Failed to Fetch approvals for the Given ID', error });
  }
});

// Get the Approvals on User Id
const getApprovalsOnCompanyID = catchAsync(async (req, res) => {
  try {
    const approvals = await approvalsService.getApprovalsOnCompanyID(req.params.company_ID);
    if (!approvals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch approvals');
    }
    const logString = logger.info(`${req.userId} Accessed approvals with companyID ${req.params.userId}`).transports[0]
      .logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', approvals });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} Failed to Access approvals with companyID ${req.params.userId} , encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(400).json({ success: false, message: 'Failed to Fetch approvals for the Given companyID', error });
  }
});

// Get the approvals on approver Id
const getApprovalsWithApproverId = catchAsync(async (req, res) => {
  try {
    const approvals = await approvalsService.getApprovalsWithApproverId(req.params.approverId);
    if (!approvals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch approvals');
    }
    const logString = logger.info(`${req.userId} Accessed approvals with Approver_ID ${req.params.approverId}`).transports[0]
      .logString;
    await loggerService.createLogger('approvals', req.params.approverId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', approvals });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} Failed to Access approvals with Approver_ID ${req.params.approverId} , encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.params.approverId, logString);
    res.status(400).json({ success: false, message: 'Failed to Fetch approvals for the Given Approver_ID', error });
  }
});

//  Replace approver Id with given ID
const replaceApproverId = catchAsync(async (req, res) => {
  try {
    const updatedApprovals = await approvalsService.replaceApproverId(req.body.approverId, req.body.idToReplace);
    if (!updatedApprovals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update Approvals');
    }
    const logString = logger.info(`${req.userId} Replaced  approval ids ${req.body.approverId} with ${req.body.idToReplace}`)
      .transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', updatedApprovals });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} Failed to Update approval ids ${req.body.approverId} with ${req.body.idToReplace}, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(400).json({ success: false, message: 'Failed to Update Approvals. Please Check the Input', error: error });
  }
});

const createOrUpdateApprovalsOnUserId = catchAsync(async (req, res) => {
  try {
    const approvals = await approvalsService.createOrUpdateApprovalsOnUserId(req.params.userId, req.body);
    if (!approvals) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create or update approvals');
    }
    const logString = logger.info(`${req.userId} Created or Updated approvals with userId ${req.params.userId}`)
      .transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(httpStatus.OK).json({ success: true, message: 'Success', approvals });
  } catch (error) {
    const logString = logger.error(
      `${req.userId} failed to create or update approvals with userId ${req.params.userId} , encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('approvals', req.userId, logString);
    res.status(400).json({ success: false, message: 'Failed to create or update approvals for the Given ID', error });
  }
});

module.exports = {
  createApprovals,
  updateApprovalsOnID,
  deleteApprovalsOnId,
  getAllApprovals,
  getApprovalsOnId,
  getApprovalsOnUserId,
  createOrUpdateApprovalsOnUserId,
  getApprovalsOnCompanyID,
  getApprovalsWithApproverId,
  replaceApproverId,
  getApprovalsOnUserIds
};
