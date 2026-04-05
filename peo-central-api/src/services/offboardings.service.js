const { ObjectId } = require('mongodb');
const { Offboardings } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment-timezone');
const { toLower } = require('lodash');
const { sendEmail } = require('../middlewares/email');
const { EmailLog, Documents, DocumentTypes } = require('../models');
const queryService = require('./query.service');
const { Users } = require('../models');
const { Processes } = require('../models');
const _ = require('lodash');

const createOffboardings = async (reqBody) => {
  let newOffboardings = new Offboardings(reqBody);
  return await newOffboardings.save();
};

const getOffboardingsById = async (offboardingId) => {
  let offboardings = await Offboardings.findById({ _id: ObjectId(offboardingId) });
  if (!offboardings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Offboardings');
  }
  return offboardings;
};

const getOffboardingsOnUserId = async (userId) => {
 try{
  console.log("getting EOSB document processes------>")
  let offboardings = await Offboardings.find({ user_id: ObjectId(userId) });
  if (!offboardings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Offboardings on the provided UserID');
  }
  console.log(offboardings.length)
  console.log(offboardings[0].processes.length, "length of processes")
  const updatedProcesses = JSON.parse(JSON.stringify(offboardings[0].processes));
  for(let i =0; i < updatedProcesses.length; i++){
    const process = updatedProcesses[i];
    console.log(process.stage_name);
    process.attachments = process.attachments || [];
    if (process.stage_name == 'EOSB sign by Employee') {
      console.log("found employee sign stage--->")
      const eosbTemplate = await DocumentTypes.findOne({name: "EOSB"});
      if (!eosbTemplate) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Could find EOSB Template');
      }
      console.log(eosbTemplate._id, "this is the id of the EOSB template");
      const previouslyUploadedDoc = await Documents.findOne(
        {
          foreign_id: ObjectId(offboardings[0]._id),
          is_deleted: false,
          type: eosbTemplate._id,
        },
        {},
        {
          sort: { _id: -1 },
        }
      );
      if (previouslyUploadedDoc && previouslyUploadedDoc.url) {
        if (!process.attachments.includes(previouslyUploadedDoc.url)) {
          process.attachments.unshift(previouslyUploadedDoc.url);
        }
      }
    };

    if (process.actions && process.actions.length > 0) {
      for (const action of process.actions) {
        if (action.required_documents && action.required_documents.length > 0) {
          const documentTypeIds = action.required_documents.map(id =>
            ObjectId.isValid(id) ? ObjectId(id) : id
          );

          const documents = await Documents.find({
            type: { $in: documentTypeIds },
            foreign_id: ObjectId(offboardings[0]._id),
            is_deleted: false,
          });

          for (const doc of documents) {
            if (doc.url && !process.attachments.includes(doc.url)) {
              process.attachments.push(doc.url);
            }
          }
        }
      }
    }
  };

  const updatedOffboardings = await Offboardings.findByIdAndUpdate(
    offboardings[0]._id,
    {
      $set: { processes: updatedProcesses },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  // return offboardings;
  return [updatedOffboardings];
 } catch(error){
  console.log(error);
  throw new Error(error);
 }
};

const updateUpdatedBy = async (offboardingId, userId) => {
  return Offboardings.findOneAndUpdate({ _id: offboardingId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (offboardingId, userId) => {
  return Offboardings.findOneAndUpdate({ _id: offboardingId }, { $set: { created_by: userId } });
};

const updateOffboardingsOnId = async (offboardingId, updateBody) => {
  const result = await getOffboardingsById(offboardingId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offboardings Not found');
  }
  return Offboardings.findOneAndUpdate({ _id: offboardingId }, { $set: updateBody }, { new: true });
};

const listAllOffboardings = async (queryObject) => {
  const options = {
    limit: queryObject.limit ? parseInt(queryObject.limit) : 20,
    skip: queryObject.page ? parseInt(queryObject.page) : 0,
    sort: { createdAt: -1 },
  };
  const query = { is_deleted: false };
  const result = await Offboardings.find(query, null, options);
  console.log('list of all offboardings', result.length);
  if (result == []) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Offboardings');
  }
  return result;
};

const offboardingProcessFlowForward = async (reqBody, offboardingId, userId) => {
  console.log('---------- OFFBOARDING PROCESS FLOW FORWARD ----------');
  const offboardingsResult = await getOffboardingsById(offboardingId);
  if (!offboardingsResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to get the Data');
  }
  const filter_progress_process_status = { _id: ObjectId(offboardingId), 'processes.process_status': 'progress' };
  let result = [];
  const docs = await Offboardings.find(filter_progress_process_status);
  for (const doc of docs) {
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
              //   const updateoffboardings = await offboardings.updateOne({ "_id": ObjectId(offboardingId) }, { $set: reqBody.documentUpdatables }, { new: true });
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
                body: reqBody.body,
              };
              if (emailBody) {
                sendEmail(emailBody.to, emailBody.subject, emailBody.body, emailBody.cc).then(async (result) => {
                  console.log('Email sent successfully:', result);
                  // await new EmailLog(emailBody).save()
                });
                action.updated_by = userId;
                action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
                action.status = 'completed';
                doc.status = process.stage_name;
              }
            }
            if (toLower(action.action_type) === 'add to visa cancellation') {
              //---------------USER CREATE VISA CANCELLATION
              action.updated_by = userId;
              action.updated_date_time = moment.tz('UTC').tz('Asia/Dubai').format();
              action.status = 'completed';
              doc.status = process.stage_name;
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
          const user_inactive = await Users.updateOne(
            { _id: ObjectId(offboardingsResult.user_id) },
            { $set: { user_status: 'inactive' } }
          );
        }
        if (allActionsCompleted && doc.processes.length != index + 1) {
          process.process_status = 'completed';
          doc.processes[index + 1].process_status = 'progress';
          if (doc.processes[index + 1].actions.length > 0) {
            doc.processes[index + 1].actions[0].status = 'progress';
          }
        } else {
          for (const action of process.actions) {
            if (action.status === 'pending') {
              action.status = 'progress';
              break;
            }
          }
        }
        result = doc;
        const updated_offboardings_process = await Offboardings.updateOne(
          { _id: ObjectId(offboardingId) },
          { $set: { processes: doc.processes, status: doc.status } }
        );
        break;
      }
      if (process.process_status === 'progress' && (!process.actions || process.actions.length === 0)) {
        process.process_status = 'completed';
        doc.status = toLower(process.stage_name);
        process.actions = [
          {
            updated_by: userId,
            updated_date_time: moment.tz('UTC').tz('Asia/Dubai').format(),
            status: 'completed',
          },
        ];
        if (doc.processes.length != index + 1) {
          doc.processes[index + 1].process_status = 'progress';
        }
        result = doc;
        const updated_offboardings_process = await Offboardings.updateOne(
          { _id: ObjectId(offboardingId) },
          { $set: { processes: doc.processes, status: doc.status } }
        );
        break;
      }
    }
  }
  return result;
};

const offboardingProcessFlowBackward = async (offboardingId) => {
  const filter_progress_process_status = { _id: ObjectId(offboardingId), 'processes.process_status': 'progress' };
  let result = [];
  await Offboardings.find(filter_progress_process_status).then((docs) => {
    docs.forEach(async (doc) => {
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
      const updated_process = await Offboardings.updateOne(
        { _id: ObjectId(offboardingId) },
        { $set: { processes: doc.processes } }
      );
    });
  });
  return result;
};

const getOffboardingDataOnID = async (offboardingId, reqBody, page, limit) => {
  let pipeline = [
    {
      $match: {
        _id: ObjectId(offboardingId),
        is_deleted: false,
      },
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$companyDetails',
    },
    {
      $unwind: '$userDetails',
    },
    {
      $project: {
        _id: 1,
        processes: 1,
        attachments: 1,
        comments: 1,
        process_type: 1,
        status: 1,
        last_working_day: 1,
        exit_reason: 1,
        salary_payable: 1,
        leave_encashment: 1,
        gratuity: 1,
        support_letter: 1,
        createdAt: 1,
        user_id: 1,
        company_id: 1,
        company_name: '$companyDetails.company_name',
        company_logo: '$companyDetails.logo',
        user_name: {
          $concat: [
            '$userDetails.first_name',
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.middle_name', null] }, { $eq: ['$userDetails.middle_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.middle_name'] },
              },
            },
            {
              $cond: {
                if: { $or: [{ $eq: ['$userDetails.last_name', null] }, { $eq: ['$userDetails.last_name', ''] }] },
                then: '',
                else: { $concat: [' ', '$userDetails.last_name'] },
              },
            },
          ],
        },
      },
    },
  ];
  if (
    reqBody.selected_company_id &&
    ((reqBody.selected_company_id.length > 0 && reqBody.selected_company_id[0] !== '') || reqBody.selected_company_id != '')
  ) {
    pipeline.unshift(...queryService(reqBody));
  }
  let result = await Offboardings.aggregate(pipeline);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Offboarding');
  }
  return result;
};

/**
 * Query for activities
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getOffBoardingFilter = async (query) => {
  let filter = {
    is_deleted: false,
  };

  if (query.companyId) {
    filter.company_id = ObjectId(query.companyId);
  }

  if (query.startDate && query.endDate) {
    filter.createdAt = {
      $gte: new Date(new Date(query.startDate).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(query.endDate).setHours(23, 59, 0, 0)),
    };
  }

  let options = {
    limit: query.limit,
    page: query.page,
    sortBy: query.sortBy,
  };

  let body = [
    {
      $project: {
        user_id: 1,
        company_id: 1,
      },
    },
    {
      $lookup: {
        from: 'users',
        let: {
          userid: '$user_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$userid'] }],
              },
            },
          },
          {
            $project: {
              first_name: 1,
              last_name: 1,
            },
          },
        ],
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'companies',
        let: {
          company_id: '$company_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$company_id'] }],
              },
            },
          },
          {
            $project: {
              first_name: 1,
              last_name: 1,
            },
          },
        ],
        as: 'company',
      },
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const getOffBoardings = await Offboardings.paginateLookup(filter, options, body);

  return getOffBoardings;
};

const getOffBoardingPipeline = async () => {
  // let pipeline_ = ['Resignation Received', 'Create Invoice', 'Record payment', 'Visa Cancellation', 'Release Payment']
  let stageList = await Processes.find({ module: 'offboardings' });
  const pipeline_ = stageList[0].stages.map((stage) => stage.stage_name);

  let diff_status = [];
  for (let index = 0; index < pipeline_.length; index++) {
    const stage = pipeline_[index];

    let project = {
      $project: {
        _id: 0,
        days_since: {
          $toInt: { $divide: [{ $subtract: [new Date(), '$updatedAt'] }, 1000 * 60 * 60 * 24] },
        },
        processes: 1,
      },
    };

    let unwind = { $unwind: '$processes' };

    let match_ = {
      $match: {
        'processes.stage_name': stage,
        'processes.process_status': 'progress',
      },
    };

    let group_ = {
      $group: {
        _id: '$processes.stage_name',
        count: { $sum: 1 },
        avgDays: { $avg: '$days_since' },
      },
    };
    let floorAvgDays = {
      $addFields: {
        avgDays: { $floor: '$avgDays' },
      },
    };

    let pipeline_status = await Offboardings.aggregate([unwind, match_, project, group_, floorAvgDays]);

    if (pipeline_status && pipeline_status.length) {
      diff_status.push(pipeline_status[0]);
    } else {
      let obj = {
        _id: stage,
        count: 0,
        avgDays: 0,
      };

      diff_status.push(obj);
    }
  }

  return diff_status;
};

const getDiffPipelineList = async (query, page, limit) => {
  // let pipeline_ = ['Resignation Received', 'Create Invoice', 'Record payment', 'Visa Cancellation', 'Release Payment']

  let filter = {
    processes: {
      $elemMatch: {
        stage_name: query.stage_name,
        process_status: 'progress',
      },
    },
  };

  let options = {
    page,
    limit,
  };

  let body = [
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails',
      },
    },
    {
      $unwind: '$companyDetails',
    },
    {
      $project: {
        _id: 0,
        days_since: {
          $toInt: { $divide: [{ $subtract: [new Date(), '$updatedAt'] }, 1000 * 60 * 60 * 24] },
        },
        user_id: 1,
        company_name: '$companyDetails.company_name',
      },
    },
    {
      $lookup: {
        from: 'users',
        let: {
          userid: '$user_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$userid'] }],
              },
            },
          },
          {
            $project: {
              first_name: 1,
              last_name: 1,
              image_url: 1,
            },
          },
        ],
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  let offBoardings = await Offboardings.paginateLookup(filter, options, body);

  return offBoardings;
};

const listOfOffboardingStatus = async (query, reqBody) => {
  let stageList = await Processes.find({ module: 'offboardings' });
  const pipeline_ = stageList[0].stages.map((stage) => stage.stage_name);
  const distinctStatuses = await Offboardings.distinct('status').exec();
  const statArr = ['inactive', 'completed'];
  const combinedArray = [...pipeline_, ...distinctStatuses, ...statArr];
  const uniqueArray = Array.from(new Set(combinedArray));
  return uniqueArray;
};

const extendedListOfUsersAndCompanies = async (offboardingId) => {
  let pipeline = [
    {
      $match: {
        _id: ObjectId(offboardingId),
      },
    },
    {
      $lookup: {
        from: 'companies',
        localField: 'company_id',
        foreignField: '_id',
        as: 'companyDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$companyDetails',
    },
    {
      $unwind: '$userDetails',
    },
    {
      $project: {
        _id: 1,
        status: 1,
        stage_type: 1,
        processes: 1,
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
        company_locations: '$companyDetails.locations',
      },
    },
  ];
  let offboardings = await Offboardings.aggregate(pipeline);
  if (!offboardings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find offboardings');
  }
  // fetch offboarding documents
  const offboardingDocs = await Documents.find({module:"offboardings", foreign_id: ObjectId(offboardingId)})
  for (let process of offboardings[0].processes){
    if (process.stage_name.toLowerCase() == "create eosb"){
        if(process.actions && process.actions.length){
          for(let action of process.actions){
            if(action.action_type == "document" && action.status == "completed"){
              const documentPreview = offboardingDocs.find((doc) => doc.name.startsWith("End_of_Service_Settlement"));
              if (documentPreview) {
                process.attachments =   process.attachments ? process.attachments : [];
                if( process.attachments.length < 1){
                  process.attachments.push(documentPreview);
                }
              }
            }
          }
        }
    }
  }
  return offboardings;
};

const getOffboardingStatusCount = async (reqBody) => {
  let pipeline = [
    { $unwind: '$processes' },
    {
      $group: {
        _id: '$processes.stage_name',
        count: {
          $sum: {
            $cond: [{ $eq: ['$processes.process_status', 'progress'] }, 1, 0],
          },
        },
      },
    },
  ];
  if (reqBody.selected_company_id) {
    pipeline.unshift(...queryService(reqBody));
  }
  let getCount = await Offboardings.aggregate(pipeline);
  let total = getCount.map((data) => data.count).reduce((partialSum, a) => partialSum + a, 0);
  getCount.push({
    _id: 'Total',
    count: total,
  });
  let process = await Processes.findOne({ is_deleted: false, process_name: 'offboarding' });
  let order = process.stages.map((a) => a.stage_name);

  order.push('Total');
  let getCountOrder = _.sortBy(
    getCount.filter((a) => order.includes(a._id)),
    function (obj) {
      return _.indexOf(order, obj._id);
    }
  );
  return getCountOrder;
};

const getApplicationDistribution = async () => {
  let pipeline = [
    {
      $project: {
        status: 1,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ];

  const distribution = await Offboardings.aggregate(pipeline);
  return distribution;
};

const removeUserFromOffBoarding = async (userId, offboardingId) => {
  const offBoarding = await Offboardings.findById(offboardingId);
  if (!offBoarding) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Offboarding');
  }
  const user = await Users.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find user');
  }

  user.user_status = 'inactive';
  await user.save();

  offBoarding.is_deleted = true;
  await offBoarding.save();
  return offBoarding;
};

module.exports = {
  getOffboardingStatusCount,
  getOffBoardingPipeline,
  getDiffPipelineList,
  createOffboardings,
  getOffBoardingFilter,
  getOffboardingsById,
  getOffboardingsOnUserId,
  updateUpdatedBy,
  updateCreatedBy,
  updateOffboardingsOnId,
  listAllOffboardings,
  offboardingProcessFlowForward,
  offboardingProcessFlowBackward,
  getOffboardingDataOnID,
  listOfOffboardingStatus,
  extendedListOfUsersAndCompanies,
  getApplicationDistribution,
  removeUserFromOffBoarding,
};
