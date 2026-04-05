const httpStatus = require("http-status");
const { roleService } = require("../services")
const catchAsync = require("../utils/catchAsync")
const ApiError = require('../utils/ApiError');
const { diff } = require('deep-object-diff');
const { activityService } = require("../services")
const logger = require('../middlewares/logger');
const { Users } = require('../models');
const { loggerService } = require("../services");

const createRole = catchAsync(async (req, res) => {
    try {
        const role = await roleService.createRole(req.body)
        const createdBy = await roleService.updateCreatedBy(role._id, req.userId);
        const logMessage = logRoleCreation(req.userId, role);
        const addActivityLog = await activityService.createActivity(req.userId, role._id, "roles", {}, role, {}, logMessage);
        const logString = (logger.info(`${req.userName} Created a Role with ID ${role._id}`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(httpStatus.CREATED).send(role);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Create Role, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(400).json({ message: 'Failed to create Role. Please Check the Input', details: error });
    }
});

function logRoleCreation(userId, role) {
    const logMsg = `User ${userId} Created Role ${role._id}`;
    return logMsg
}

const updateRole = catchAsync(async (req, res) => {
    try {
        const existingRolebyID = await roleService.roleById(req.params.roleId);
        const updatedRole = await roleService.updateRole(req.params.roleId, req.body, req.userId);
        const updatedBy = await roleService.updateUpdatedBy(req.params.roleId, req.userId);
        const updatedFields = diff(existingRolebyID.toJSON(), updatedRole.toJSON());
        const logMessage = logRoleUpdates(req.userId, existingRolebyID, updatedRole, updatedFields);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.roleId, "roles", existingRolebyID, updatedRole, updatedFields, logMessage);
        if (!updatedRole) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update role');
        }
        const logString = (logger.info(`${req.userName} Updated a Role with RoleID ${req.params.roleId}`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(httpStatus.OK).send(updatedRole)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Update Role with RoleID ${req.params.roleId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(400).json({ message: 'Failed to Update Role. Please Check the Input', details: error });
    }
});

function logRoleUpdates(userId, oldDoc, updatedRole, updatedFields) {
    const logMsg = `User ${userId} updated Role ${updatedRole._id}\nFields:`;
    const fieldUpdates = [];
    for (const field in updatedFields) {
        fieldUpdates.push(`  ${field}: ${oldDoc[field]} -> ${updatedRole[field]}`);
    }
    // console.log(`${logMsg}\n${fieldUpdates.join('\n')}`);
    return `${logMsg}\n${fieldUpdates.join('\n')}`
}

const listAllRoles = catchAsync(async (req, res) => {
    try {
        const role = await roleService.listAllRoles()
        if (!role) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch all roles');
        }
        const logString = (logger.info(`${req.userName} Accessed all the Roles`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(httpStatus.OK).send(role)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access all the Roles , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch All Roles', details: error });
    }
});

const roleById = catchAsync(async (req, res) => {
    try {
        const role = await roleService.roleById(req.params.roleId)
        if (!role) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot fetch role');
        }
        const logString = (logger.info(`${req.userName} Accessed Roles with RoleID ${req.params.roleId}`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(httpStatus.OK).send(role)
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Access Roles with RoleID ${req.params.roleId} , encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(400).json({ message: 'Failed to Fetch Roles for the Given ID', details: error });
    }
})

const deleteRole = catchAsync(async (req, res) => {
    try {
        const existingRolebyID = await roleService.roleById(req.params.roleId);
        const role = await roleService.deleteRole(req.params.roleId)
        const updatedBy = await roleService.updateUpdatedBy(req.params.roleId, req.userId);
        const logMessage = logRoleDeletion(req.userId, role);
        const addActivityLog = await activityService.createActivity(req.userId, req.params.roleId, "roles", existingRolebyID, {}, {}, logMessage);
        if (!role) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete role');
        }
        const logString = (logger.info(`${req.userName} Deleted Roles with RoleID ${req.params.roleId}`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(httpStatus.OK).send(role);
    } catch (error) {
        const logString = (logger.error(`${req.userName} Failed to Delete Roles with RoleID ${req.params.roleId}, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('roles', req.userId, logString);
        res.status(400).json({ message: 'Failed to Delete Roles for the Given ID', details: error });
    }
})

function logRoleDeletion(userId, updatedRole) {
    const logMsg = `User ${userId} Deleted Role ${updatedRole._id}`;
    return logMsg
}


module.exports = {
    createRole,
    updateRole,
    listAllRoles,
    roleById,
    deleteRole
}