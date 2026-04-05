const { Loggers } = require('../models');
const { ObjectId } = require("mongodb");
const ApiError = require('../utils/ApiError');
const httpStatus = require("http-status")

const createLogger = async (module, userId, message) => {
  let logBody = {}
  if (userId && userId != null) {
    logBody.user_id = userId;
  }
  logBody.module = module;
  logBody.message = message;
  let newLog = new Loggers(logBody)
  return await newLog.save()
}

const updateLoggersOnId = async (loggerId, updateLogBody) => {
  const logResult = await getLoggerById(loggerId);
  if (!logResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Log Not found');
  }
  return Loggers.findOneAndUpdate({ _id: loggerId }, { $set: updateLogBody }, { new: true });
}

const deleteLoggerOnId = async (loggerId) => {
  let log = await Loggers.findByIdAndUpdate({ "_id": ObjectId(loggerId) }, { is_deleted: true })
  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cannot delete Logs")
  }
  return log;
}

const getAllLoggers = async () => {
  const log = await Loggers.find({ is_deleted: false });
  if (log === []) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Logs")
  }
  return log
}

const getLoggersByModule = async (module) => {
  const log = await Loggers.findOne({ module });
  if (log === []) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Logs")
  }
  return log
}

const getLoggerById = async (id, project = {}) => {
  const log = await Loggers.findById(id, project);
  if (log === []) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Logs")
  }
  return log
}

const loggerByUserId = async (userId) => {
  let logs = await Loggers.find({ "user_id": userId })
  if (!logs) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Logs")
  }
  return logs
}

const filterAndSearchLogger = async (query, reqBody) => {
  let result;
  const searchRegex = new RegExp(reqBody.search, "i");
  let filter = {
    is_deleted: false
  }
  let body = [{
    $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "userDetails"
    }
  },
  {
    $unwind: '$userDetails'
  },
  {
    $project: {
      _id: 1,
      user_id: 1,
      module: 1,
      message: 1,
      createdAt: 1,
      user_first_name: "$userDetails.first_name",
      user_middle_name: "$userDetails.middle_name",
      user_last_name: "$userDetails.last_name",
      user_email: "$userDetails.email"
    }
  },
  {
    $match: {
      $or: [
        { module: searchRegex },
        { message: searchRegex },
        { user_first_name: searchRegex },
        { user_middle_name: searchRegex },
        { user_last_name: searchRegex },
        { user_email: searchRegex }
      ]
    }
  }]

  if (reqBody.user_id && ((reqBody.user_id.length > 0 && reqBody.user_id[0] !== "") || reqBody.user_id != "")) {
    if (Array.isArray(reqBody.user_id)) {
      let usrID = reqBody.user_id.map(id => ObjectId(id));
      filter.user_id = { $in: usrID }
    } else {
      filter.user_id = ObjectId(reqBody.user_id);
    }
  }
  if (reqBody.module && (reqBody.module != "" || (reqBody.module.length > 0 && reqBody.module[0] !== ""))) {
    if (Array.isArray(reqBody.module)) {
      filter.module = { $in: reqBody.module };
    } else {
      filter.module = reqBody.module;
    }
  }
  if (reqBody.start_date && reqBody.end_date && reqBody.start_date != "" && reqBody.end_date != "") {
    const endDate = new Date(reqBody.end_date);
    endDate.setDate(endDate.getDate() + 1);
    filter.createdAt = { $gte: new Date(reqBody.start_date), $lte: new Date(endDate) }
  }
  let options = {
    limit: query.limit,
    page: query.page,
    sortBy: query.sortBy
  }
  result = await Loggers.paginateLookup(filter, options, body);
  return result
}

module.exports = {
  createLogger,
  updateLoggersOnId,
  deleteLoggerOnId,
  getAllLoggers,
  getLoggersByModule,
  getLoggerById,
  loggerByUserId,
  filterAndSearchLogger
}