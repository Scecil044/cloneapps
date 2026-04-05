const { ObjectId } = require("mongodb");
const { Activity } = require("../models")
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');

const createActivity = async (userId, docId, module, oldDoc, newDoc, updatedFields, logMessage) => {
    let activityBody = {}
    activityBody.user_id = userId;
    activityBody.document_id = docId;
    activityBody.module = module;
    if(oldDoc) {
        activityBody.oldDoc = oldDoc;
    }
    activityBody.newDoc = newDoc;
    activityBody.updatedFields = updatedFields;
    activityBody.logMessage = logMessage;
    let newActivity = new Activity(activityBody)
    return await newActivity.save()
}

const updateActivityOnId = async (activityId, updateActivityBody) => {
    const activity = await activityById(activityId);
    if (!activity) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Activity Not found');
    }
    return Activity.findOneAndUpdate({ _id: activityId }, { $set: updateActivityBody }, { new: true });
}

const listAllActivities = async () => {
    const activities = await Activity.find({ is_deleted: false });
    if (activities === []) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Activities")
    }
    return activities
}

const activityById = async (activityId) => {
    let activities = await Activity.findById({ "_id": ObjectId(activityId) })
    if (!activities) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Activities")
    }
    return activities
}

const deleteActivity = async (activityId) => {
    let activities = await Activity.findByIdAndUpdate({ "_id": ObjectId(activityId) }, { is_deleted: true })
    if (!activities) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot delete Activities")
    }
    return activities
}

const activityByUserId = async (userId) => {
    let activities = await Activity.find({ "user_id": userId })
    if (!activities) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Activities")
    }
    return activities
}

const activityByDocId = async (documentId) => {
    let activities = await Activity.find({ "document_id": documentId })
    if (!activities) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Activities")
    }
    return activities
}

const activityOnModuleName = async (module) => {
    let activities = await Activity.find({ "module": module })
    if (!activities) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Activities")
    }
    return activities
}

module.exports = {
    createActivity,
    updateActivityOnId,
    listAllActivities,
    activityById,
    deleteActivity,
    activityByUserId,
    activityByDocId,
    activityOnModuleName
}