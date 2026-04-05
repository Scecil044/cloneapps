const { ObjectId } = require('mongodb');
const { Approvals, CoreConfig, Users } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

// Create a new Approvals
const createApprovals = async approvalBody => {
  const newApproval = await Approvals.insertMany(approvalBody);
  return newApproval;
};

// Get All Approvals
const getAllApprovals = async () => {
  const approvals = await Approvals.find({ deleted: false });
  if (!approvals) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Approvals not found');
  }
  return approvals;
};

// Get Approvals on Id
const getApprovalsOnId = async approvalsId => {
  const approvals = await Approvals.findOne({ _id: ObjectId(approvalsId), deleted: false });
  if (!approvals) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Approvals not Found');
  }
  return approvals;
};

// Get Approvals on UserId
const getApprovalsOnUserId = async userId => {
  const approvals = await Approvals.find({ user_id: ObjectId(userId), deleted: false });
  if (!approvals) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Approvals not Found');
  }
  return approvals;
};

// Get Approvals on UserIds
const getApprovalsOnUserIds = async userIds => {
  const userObjIds = userIds.map(id => ObjectId(id));
  const approvals = await Approvals.aggregate([
    { $match: { user_id: { $in: userObjIds }, deleted: false } },
    {
      $group: {
        _id: '$user_id',
        approvals: { $push: '$$ROOT' }
      }
    }
  ]);
  if (!approvals) throw new ApiError(httpStatus.NOT_FOUND, 'Approvals not Found');
  let approvalsObj = {};
  for (const approval of approvals) {
    approvalsObj[approval._id] = approval.approvals;
  }
  return approvalsObj;
};

// Get Approvals on companyID
const getApprovalsOnCompanyID = async companyId => {
  const users = await Users.find({ company_id: ObjectId(companyId) }).select('_id');
console.log(users)
  if (users.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Users not found');
  }
  const userIds = users.map(user => ObjectId(user._id));

  const userApprovals = await Approvals.aggregate([
    { $match: { user_id: { $in: userIds }, deleted: false } },
    {
      $group: {
        _id: '$user_id',
        approvals: { $push: '$$ROOT' }
      }
    }
  ]);

  if (!userApprovals) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Approvals not found');
  }
  return userApprovals;
};

const getApprovalsWithApproverId = async approverId => {
  let activeHoldUsers = await Users.find({ user_status: { $in: ['active', 'onboarding', 'offboarding'] } }, { _id: 1, first_name: 1 });
  activeHoldUsers.sort((a, b) => a.first_name.toLowerCase().localeCompare(b.first_name.toLowerCase()));
  const stringIds = activeHoldUsers.map(user => String(user._id));
  const userIds = activeHoldUsers.map(user => user._id);
  const userApprovals = await Approvals.aggregate([
    {
      $match: {
        $or: [
          { 'approvers.level_1': { $in: [approverId] } },
          { 'approvers.level_2': { $in: [approverId] } },
          { 'approvers.level_3': { $in: [approverId] } },
          { 'approvers.level_4': { $in: [approverId] } }
        ],
        deleted: false,
        user_id: { $in: userIds }
      }
    },
    {
      $group: {
        _id: '$user_id',
        approvals: { $push: '$$ROOT' }
      }
    }
  ]);
  userApprovals.sort((a, b) => {
    const indexA = stringIds.indexOf(String(a._id));
    const indexB = stringIds.indexOf(String(b._id));
    return indexA - indexB;
  });
  if (!userApprovals) throw new ApiError(httpStatus.NOT_FOUND, 'Approvals not found');
  return userApprovals;
};

const replaceApproverId = async (approverId, idToReplace) => {
  const activeHoldUsers = await Users.find({ user_status: { $in: ['active', 'onboarding', 'offboarding'] } }, { _id: 1 });
  const userIds = activeHoldUsers.map(user => user._id);
  const userApprovals = await Approvals.aggregate([
    {
      $match: {
        $or: [
          { 'approvers.level_1': { $in: [approverId] } },
          { 'approvers.level_2': { $in: [approverId] } },
          { 'approvers.level_3': { $in: [approverId] } },
          { 'approvers.level_4': { $in: [approverId] } }
        ],
        deleted: false,
        user_id: { $in: userIds }
      }
    }
  ]);
  if (!userApprovals) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Approvals not found');
  }
  let bulkWriteArr = [];
  for (const approval of userApprovals) {
    for (var index = 0; index < approval.approvers.approver_levels; index++) {
      var total = index + 1;
      var level_no = 'level_' + total;
      approval.approvers[level_no] = approval.approvers[level_no].map(elem => {
        if (elem === approverId) return idToReplace;
        else return elem;
      });
    }
    bulkWriteArr.push({
      updateOne: {
        filter: { _id: approval._id },
        update: { $set: approval }
      }
    });
  }
  const result = await Approvals.bulkWrite(bulkWriteArr);
  console.log(result);

  return result;
};

// Update Approvals on ID
// const updateApprovalsOnID = async (approvalsId, updateBody, userId) => {
//   const approvalsData = await Approvals.findOne({ _id: ObjectId(approvalsId), deleted: false });
//   if (!approvalsData) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Approval Not Found');
//   }
//   await Approvals.updateOne(
//     {
//       _id: ObjectId(approvalsId)
//     },
//     {
//       $set: {
//         user_id: updateBody?.user_id ? updateBody?.user_id : approvalsData?.user_id,
//         module: updateBody?.module ? updateBody?.module : approvalsData?.module,
//         'approvers.approver_levels': updateBody?.approvers?.approver_levels
//           ? updateBody?.approvers?.approver_levels
//           : approvalsData?.approvers?.approver_levels,
//         'approvers.level_1': updateBody?.approvers?.level_1
//           ? updateBody?.approvers?.level_1
//           : approvalsData?.approvers?.level_1,
//         'approvers.level_2': updateBody?.approvers?.level_2
//           ? updateBody?.approvers?.level_2
//           : approvalsData?.approvers?.level_2,
//         'approvers.level_3': updateBody?.approvers?.level_3
//           ? updateBody?.approvers?.level_3
//           : approvalsData?.approvers?.level_3,
//         'approvers.level_4': updateBody?.approvers?.level_4
//           ? updateBody?.approvers?.level_4
//           : approvalsData?.approvers?.level_4,
//         'approvers.level_5': updateBody?.approvers?.level_5
//           ? updateBody?.approvers?.level_5
//           : approvalsData?.approvers?.level_5,
//         required_approvers: updateBody?.required_approvers,
//         dateUpdated: new Date(),
//         updatedBy: userId
//       }
//     }
//   );
// };
const updateApprovalsOnID = async (approvalsId, updateBody, userId) => {
  const approvalsData = await Approvals.findOne({ _id: new ObjectId(approvalsId), deleted: false });
  
  if (!approvalsData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Approval Not Found');
  }

  const updateFields = {
    user_id: updateBody.user_id ?? approvalsData.user_id,
    module: updateBody.module ?? approvalsData.module,
    required_approvers: updateBody.required_approvers,
    dateUpdated: new Date(),
    updatedBy: userId
  };

  // Update approvers
  if (updateBody.approvers) {
    updateFields.approvers = {
      approver_levels: updateBody.approvers.approver_levels ?? approvalsData.approvers.approver_levels
    };

    for (let i = 1; i <= 5; i++) {
      const level = `level_${i}`;
      updateFields.approvers[level] = updateBody.approvers[level] ?? approvalsData.approvers[level];
    }
  }

  const result = await Approvals.updateOne(
    { _id: new ObjectId(approvalsId) },
    { $set: updateFields }
  );

  return Approvals.findOne({ _id: new ObjectId(approvalsId) });
};
// Delete Approvals on ID
const deleteApprovalsOnId = async (approvalsId, userId) => {
  const deletedApproval = await Approvals.findOneAndUpdate(
    { _id: ObjectId(approvalsId) },
    { $set: { deleted: true, updatedBy: userId } },
    { new: true }
  );
  if (!deletedApproval) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Approval Not Found');
  }
  return deletedApproval;
};

const createOrUpdateApprovalsOnUserId = async (userId, approvalsBody) => {
  let { modules, approvers, required_approvers } = approvalsBody;
  let availableApprovals = await Approvals.find({ user_id: ObjectId(userId), deleted: false });
  let newApprovals = [];
  const user = await Users.findOne({ _id: ObjectId(userId) }, { company_ID: 1 }).lean();
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User Not Found');

  const configuration = await CoreConfig.findOne({ company_ID: ObjectId(user.company_ID) }, { requestTypes: 1 }).lean();
  if (!configuration) throw new ApiError(httpStatus.NOT_FOUND, 'Configuration Not Found');
  let requestTypes = configuration.requestTypes
    .filter(element => element != 'salary adjustment')
    .filter(
      element =>
        !(
          availableApprovals && availableApprovals.some(approval => approval.module == getCorrespondingModuleType(element))
        ) && modules.some(module_name => getCorrespondingModuleType(element) == module_name)
    );

  if (requestTypes.includes('passport release') || requestTypes.includes('passport safekeep')) {
    let index = requestTypes.indexOf('passport release');
    if (index != -1) requestTypes.splice(index, 1);
    index = requestTypes.indexOf('passport safekeep');
    if (index != -1) requestTypes.splice(index, 1);
    requestTypes.push('passport');
  }

  for (let requestType of requestTypes) {
    newApprovals.push({
      user_id: userId,
      module: getCorrespondingModuleType(requestType),
      approvers,
      required_approvers,
      date_created: new Date(),
      application_log: [],
      deleted: false,
      dateUpdated: new Date(),
      updatedBy: userId
    });
  }
  const approvals = await Approvals.insertMany(newApprovals);
  let updatedApprovals = [];
  if (availableApprovals) {
    for (let approval of availableApprovals) {
      if (
        !requestTypes.some(type => getCorrespondingModuleType(type) == approval.module) &&
        modules.some(module => getCorrespondingModuleType(module) == approval.module)
      ) {
        const result = await Approvals.findOneAndUpdate(
          { _id: ObjectId(approval._id) },
          { $set: { approvers, required_approvers, updatedBy: userId } },
          { new: true }
        );
        updatedApprovals.push(result);
      }
    }
  }
  approvals.push(...updatedApprovals);
  return approvals;
};

const getCorrespondingRequestType = module => {
  switch (module) {
    case 'claim':
      return 'claims';
    case 'letter':
      return 'letters';
    case 'leave':
      return 'leave';
    case 'loan':
      return 'loan';
    case 'passport safekeep':
      return 'passport';
    case 'passport release':
      return 'passport';
    default:
      return module;
  }
};

const getCorrespondingModuleType = module => {
  switch (module) {
    case 'claims':
      return 'claim';
    case 'letters':
      return 'letter';
    case 'leaves':
      return 'leave';
    case 'loans':
      return 'loan';
    case 'passport safekeep':
      return 'passport';
    case 'passport release':
      return 'passport';
    default:
      return module;
  }
};

module.exports = {
  createApprovals,
  getAllApprovals,
  getApprovalsOnId,
  getApprovalsOnUserId,
  updateApprovalsOnID,
  deleteApprovalsOnId,
  createOrUpdateApprovalsOnUserId,
  getApprovalsOnCompanyID,
  getApprovalsWithApproverId,
  replaceApproverId,
  getApprovalsOnUserIds
};
