const { TaskService, loggerService } = require("../services")
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { diff } = require('deep-object-diff');
const logger = require('../middlewares/logger');
const ApiError = require('../utils/ApiError');

const fetchTasks = catchAsync(async(req, res)=>{
    try{
        const response = await TaskService.fetchTasks(req.body,req.query, req.userId);
        const logString = logger.info(`${req.userName} fetched Tasks with filters ${JSON.stringify(req.body)}`)
            .transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = (logger.error(`${req.userName} Failed to Fetch Tasks, encountered following error => ${error?.message}`)).transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        // throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch tasks');
        throw error;
    }
});

const fetchUserTasksList = catchAsync(async(req, res)=>{
    try{
        const response = await TaskService.fetchTasksList(req.body,req.query, req.userId);
        const logString = logger.info(`${req.userName} fetched user Tasks with filters ${JSON.stringify(req.body)}`)
            .transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = (logger.error(`${req.userName} Failed to Fetch Tasks, encountered following error => ${error?.message}`)).transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        // throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch tasks');
        throw error;
    }
});

const getTaskById = catchAsync(async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const task = await TaskService.getTaskById(taskId);
        if (!task) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
        }
        const logString = logger.info(`${req.userName} fetched Task with ID ${taskId}`)
            .transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(httpStatus.OK).json(task);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Fetch Task, encountered following error => ${error?.message}`)).transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch Task. Please Check the Input', details: error?.message });
    }
}
);
const createTask = catchAsync(async (req, res) => {
    try {
      const createdTask = await TaskService.createTask(req.body);
        const logString = logger.info(`${req.userName} created Task with title ${req.body.title}`)
            .transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(httpStatus.CREATED).json(createdTask);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create Task, encountered following error => ${error?.message}`)).transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(400).json({ message: 'Failed to create Task. Please Check the Input', details: error?.message });
    }
});

const updateTask = catchAsync(async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const task = await TaskService.getTaskById(taskId);
        if (!task) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
        }
        const updatedTask = await TaskService.updateTask(taskId, req.body, req.userId, req.userName, req.userEmail);
        const changes = diff(task, updatedTask);
        const logString = logger.info(`${req.userName} updated Task with ID ${taskId}, Changes: ${JSON.stringify(changes)}`)
            .transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(httpStatus.OK).json(updatedTask);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update Task, encountered following error => ${error?.message}`)).transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(400).json({ message: 'Failed to update Task. Please Check the Input', details: error?.message });
    }
});

const deleteTask = catchAsync(async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const response = await TaskService.deleteTask(taskId, req.userId);
        const logString = logger.info(`${req.userName} deleted Task with ID ${taskId}`)
            .transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(httpStatus.OK).json({ message: 'Task deleted successfully' });
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete Task, encountered following error => ${error?.message}`)).transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(400).json({ message: 'Failed to delete Task. Please Check the Input', details: error?.message });
    }
}
);

const getTaskStatistics = catchAsync(async (req, res) => {
    try {
        // Get userId from request body, query params, or use null for all tasks
        const filterUserId = req.query.user_id || req.userId || null;
        const stats = await TaskService.getTaskStatistics(filterUserId);
        const logString = logger.info(`${req.userName} fetched Task Statistics${filterUserId ? ` for user ${filterUserId}` : ' for all users'}`)
            .transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(httpStatus.OK).json(stats);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Fetch Task Statistics, encountered following error => ${error?.message}`)).transports[0].logString;
        await loggerService.createLogger('Task', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch Task Statistics. Please Check the Input', details: error?.message });
    }
});

module.exports = {
    createTask,
    updateTask,
    deleteTask,
    fetchTasks,
    getTaskById,
    getTaskStatistics,
    fetchUserTasksList
}
