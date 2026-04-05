const { ObjectId } = require('mongodb');
const { Leads, Activity } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Task, Processes } = require('../models');
const cron = require('node-cron');
const activityService = require('./activities.service');
const { diff } = require('deep-object-diff');

const getTaskStatistics = async userId => {
  const knownStatuses = ['pending', 'in progress', 'completed'];
  let knownProcessNames = [];
  // get lead process
  const leadProcess = await Processes.findOne({ module: /leads/i });
  if (!leadProcess) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find lead process');
  }
  if (leadProcess && leadProcess.stages.length) {
    let element;
    for (let i = 0; i < leadProcess.stages.length; i++) {
      element = leadProcess.stages[i];
      knownProcessNames.push(element.stage_name);
    }
  }

  // Get current date boundaries for today's tasks
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // Base filter - apply user filter if userId is provided
  const baseFilter = { is_deleted: false };
  if (userId) {
    baseFilter.user_id = ObjectId(userId);
  }

  const [statusStats, processStats, totalTasks, overdueTasks, completedTasks, todaysTasks, upcomingTasks, deletedTasks] =
    await Promise.all([
      Task.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Task.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: '$processName',
            count: { $sum: 1 }
          }
        }
      ]),
      Task.countDocuments(baseFilter),
      Task.countDocuments({
        ...baseFilter,
        due_date: { $lt: startOfToday },
        status: { $ne: 'completed' }
      }),
      Task.countDocuments({ ...baseFilter, status: 'completed' }),
      Task.countDocuments({
        ...baseFilter,
        due_date: { $gte: startOfToday, $lt: endOfToday }
      }),
      Task.countDocuments({
        ...baseFilter,
        due_date: { $gte: endOfToday },
        status: { $ne: 'completed' }
      }),
      Task.countDocuments({ is_deleted: true, ...(userId && { user_id: ObjectId(userId) }) })
    ]);

  // Normalize stats to include 0s for missing keys
  const statusBreakdown = knownStatuses.reduce((acc, status) => {
    const match = statusStats.find(s => s._id === status);
    acc[status] = match ? match.count : 0;
    return acc;
  }, {});

  const processBreakdown = knownProcessNames.reduce((acc, processName) => {
    const match = processStats.find(p => p._id === processName);
    acc[processName] = match ? match.count : 0;
    return acc;
  }, {});

  return {
    todaysTasks,
    overdueTasks,
    completedTasks,
    upcomingTasks,
    totalTasks,
    deletedTasks,
    statusBreakdown,
    processBreakdown
  };
};

const fetchTasks = async (reqBody, reqQuery, userId) => {
  try {
    const filter = { is_deleted: false };

    // Add filters for leadId and processId
    if (reqBody.leadId) {
      filter.leadId = ObjectId(reqBody.leadId);
    }
    if (reqBody.processId) {
      filter.processId = ObjectId(reqBody.processId);
    }
    if (reqBody.status) {
      filter.status = reqBody.status;
    }
    if (reqBody.user_id) {
      filter.user_id = ObjectId(reqBody.user_id);
    }

    const options = {
      page: reqQuery.page ? parseInt(reqQuery.page) : 1,
      limit: reqQuery.limit ? parseInt(reqQuery.limit) : 10,
      sortBy: reqQuery.sort ? reqQuery.sort : 'createdAt:desc'
    };
    let selectedCategory;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    if (reqBody.category) {
      selectedCategory = reqBody.category.toLowerCase();

      switch (selectedCategory) {
        case 'pending':
          filter.status = 'pending';
          break;

        case 'in progress':
          filter.status = 'in progress';
          break;

        case 'completed':
          filter.status = 'completed';
          break;

        case 'overdue':
          filter.due_date = { $lt: startOfToday };
          filter.status = { $ne: 'completed' };
          break;

        case 'today':
          filter.due_date = { $gte: startOfToday, $lt: endOfToday };
          filter.status = { $ne: 'completed' };
          break;

        case 'upcoming':
          filter.due_date = { $gte: endOfToday };
          filter.status = { $ne: 'completed' };
          break;

        default:
          filter.status = 'pending';
      }
    }

    const pipeline = [
      {
        $lookup: {
          from: 'leads',
          localField: 'leadId',
          foreignField: '_id',
          as: 'leadDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'assignedToDetails'
        }
      },
      {
        $unwind: {
          path: '$leadDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'leadDetails.company_id',
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
        $unwind: {
          path: '$assignedToDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          _id_str: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'activities',
          localField: '_id_str',
          foreignField: 'document_id',
          as: 'activityDetails',
          pipeline: [
            {
              $project: {
                _id: 1,
                module: 1,
                logMessage: 1,
                createdAt: 1,
                updatedAt: 1
              }
            }
          ]
        }
      },
      // {
      //   $unwind: {
      //     path: '$activityDetails',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          due_date: 1,
          status: 1,
          processName: 1,
          processId: 1,
          follow_up: 1,
          leadId: 1,
          user_id: 1,
          start_time: 1,
          createdAt: 1,
          updatedAt: 1,
          leadDetails: {
            _id: '$leadDetails._id',
            lead_name: '$leadDetails.lead_name',
            client_type: '$leadDetails.client_type',
            service_type: '$leadDetails.service_type',
            status: '$leadDetails.status',
            company_name: '$companyDetails.company_name',
            user_id: '$leadDetails.user_id',
            createdAt: '$leadDetails.createdAt'
          },
          assignedToDetails: {
            _id: '$assignedToDetails._id',
            first_name: '$assignedToDetails.first_name',
            last_name: '$assignedToDetails.last_name',
            middle_name: '$assignedToDetails.middle_name',
            email: '$assignedToDetails.email',
            image_url: {
              $ifNull: ['$assignedToDetails.image_url', '']
            }
          },
          activityDetails: 1
        }
      }
    ];

    // Add search logic after lookups
    if (reqQuery.search && reqQuery.search !== '') {
      const search = new RegExp(reqQuery.search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { title: search },
            { description: search },
            { processName: search },
            { 'leadDetails.lead_name': search },
            { 'assignedToDetails.first_name': search },
            { 'assignedToDetails.last_name': search },
            { 'assignedToDetails.middle_name': search },
            { 'assignedToDetails.email': search }
          ]
        }
      });
    }

    return await Task.paginateLookup(filter, options, pipeline);

    // if (!response || response.totalResults === 0) {
    //   throw new ApiError(httpStatus.NOT_FOUND, 'No tasks found');
    // }
  } catch (error) {
    throw error; // Will be handled by your outer catchAsync wrapper
  }
};

const fetchTasksList = async (reqBody, reqQuery, userId) => {
  try {
    const filter = { is_deleted: false };

    // Add filters for leadId and processId
    if (reqBody.leadId) {
      filter.leadId = ObjectId(reqBody.leadId);
    }
    if (reqBody.processId) {
      filter.processId = ObjectId(reqBody.processId);
    }
    if (reqBody.status) {
      filter.status = reqBody.status;
    }
    if (reqBody.user_id) {
      filter.user_id = ObjectId(reqBody.user_id);
    }

    const options = {
      page: reqQuery.page ? parseInt(reqQuery.page) : 1,
      limit: reqQuery.limit ? parseInt(reqQuery.limit) : 10,
      sortBy: reqQuery.sort ? reqQuery.sort : 'createdAt:desc'
    };

    const pipeline = [
      {
        $lookup: {
          from: 'leads',
          localField: 'leadId',
          foreignField: '_id',
          as: 'leadDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'assignedToDetails'
        }
      },
      {
        $unwind: {
          path: '$leadDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$assignedToDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          _id_str: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'activities',
          localField: '_id_str',
          foreignField: 'document_id',
          as: 'activityDetails',
          pipeline: [
            {
              $project: {
                _id: 1,
                module: 1,
                logMessage: 1,
                createdAt: 1,
                updatedAt: 1
              }
            }
          ]
        }
      },
      // {
      //   $unwind: {
      //     path: '$activityDetails',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          due_date: 1,
          status: 1,
          processName: 1,
          follow_up: 1,
          leadId: 1,
          processId: 1,
          user_id: 1,
          start_time: 1,
          createdAt: 1,
          updatedAt: 1,
          leadDetails: {
            _id: '$leadDetails._id',
            lead_name: '$leadDetails.lead_name',
            client_type: '$leadDetails.client_type',
            service_type: '$leadDetails.service_type',
            status: '$leadDetails.status',
            company_name: '$leadDetails.lead_name',
            user_id: '$leadDetails.user_id',
            createdAt: '$leadDetails.createdAt'
          },
          assignedToDetails: {
            _id: '$assignedToDetails._id',
            first_name: '$assignedToDetails.first_name',
            last_name: '$assignedToDetails.last_name',
            middle_name: '$assignedToDetails.middle_name',
            email: '$assignedToDetails.email',
            image_url: {
              $ifNull: ['$assignedToDetails.image_url', '']
            }
          },
          activityDetails: 1
        }
      }
    ];

    // Add search logic after lookups
    if (reqQuery.search && reqQuery.search !== '') {
      const search = new RegExp(reqQuery.search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { title: search },
            { description: search },
            { processName: search },
            { 'leadDetails.lead_name': search },
            { 'assignedToDetails.first_name': search },
            { 'assignedToDetails.last_name': search },
            { 'assignedToDetails.middle_name': search },
            { 'assignedToDetails.email': search }
          ]
        }
      });
    }

    return await Task.paginateLookup(filter, options, pipeline);

    // if (!response || response.totalResults === 0) {
    //   throw new ApiError(httpStatus.NOT_FOUND, 'No tasks found');
    // }
  } catch (error) {
    throw error; // Will be handled by your outer catchAsync wrapper
  }
};

const getTaskById = async taskId => {
  try {
    console.log('getting task by id');
    let task = await Task.findOne({ _id: ObjectId(taskId), is_deleted: false });
    const filter = { module: 'tasks', document_id: taskId };
    let activityDetails = await Activity.find(filter);
    if(Array.isArray(activityDetails) && activityDetails.length > 0) {
      // filter to only return specified fields
      const filteredActivityDetails = activityDetails.map(activity => ({
        _id: activity._id.toString(),
        document_id: activity.document_id.toString(),
        logMessage: activity.logMessage.toString(),
        module: activity.module.toString(),
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString()
      }));
      activityDetails = filteredActivityDetails;
    }
    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
    }
    task = task.toObject();
    task.activityDetails = activityDetails;
    return task;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Failed to fetch task by the provided id');
  }
};

const updateTask = async (taskId, updateBody, userId, userName, userEmail) => {
  try {
    console.log(userName, userEmail, userId, 'user details');
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
    }

    // Capture the original state before any modifications
    const originalTask = task.toObject();

    Object.assign(task, updateBody);
    task.updated_by = userId;
    await task.save();

    /**
     * ==============================================
     * Create activity log for task update
     * ==============================================
     */
    const updatedTask = task.toObject();
    const updatedFields = diff(originalTask, updatedTask);

    const fieldChanges = Object.entries(updatedFields)
      .filter(([key, newValue]) => key in updateBody) // only keys that were in updateBody
      .map(([key, newValue]) => {
        const oldValue = originalTask[key];
        return `${key} from ${oldValue} to ${newValue}`;
      })
      .join(', ');
    let activityBody = {
      user_id: userId,
      document_id: taskId,
      module: 'tasks',
      oldDoc: originalTask,
      newDoc: updatedTask,
      updatedFields: updatedFields,
      logMessage: fieldChanges
        ? `Task updated by ${userName || 'Unknown'} (${userEmail || 'N/A'}) — changed ${fieldChanges}`
        : `Task updated by ${userName || 'Unknown'} (${userEmail || 'N/A'})`,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    await Activity.create(activityBody);
    return task;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createTask = async (reqBody, userId) => {
  try {
    return Task.create({ ...reqBody, created_by: userId });
  } catch (error) {
    throw error;
  }
};

const deleteTask = async (taskId, userId) => {
  try {
    const isTask = await Task.findById(taskId);
    isTask.is_deleted = true;
    isTask.deleted_by = userId;
    await isTask.save();
    return isTask;
  } catch (error) {
    throw error;
  }
};

const getTasksByLeadId = async (leadId, processId) => {
  try {
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getTasksByLeadId,
  createTask,
  updateTask,
  getTaskById,
  deleteTask,
  fetchTasks,
  getTaskStatistics,
  fetchTasksList
};
