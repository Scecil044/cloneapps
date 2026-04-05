const { ObjectId } = require("mongodb");
const { Processes } = require("../models")
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');

const createProcesses = async (processBody) => {
    let newProcess = new Processes(processBody)
    return await newProcess.save()
}

const listAllProcesses = async () => {
    const processes = await Processes.find({ is_deleted: false });
    if (processes == []) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Processes")
    }
    return processes
}

const getProcessOnModuleName = async (module) => {
    const processes = await Processes.findOne({ module });
    if (processes == []) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Processes")
    }
    return processes
}

const processById = async (processId) => {
    let result = await Processes.findById({ "_id": ObjectId(processId) })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Process")
    }
    return result
}

const updateProcessOnId = async (processId, updateBody) => {
    const result = await processById(processId);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Process Not found');
    }
    return Processes.findOneAndUpdate({ _id: processId }, { $set: updateBody }, { new: true });
}

const deleteProcessOnId = async (processId) => {
    let result = await Processes.findByIdAndUpdate({ "_id": ObjectId(processId) }, { is_deleted: true })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot delete Process")
    }
    return result
}

const updateUpdatedBy = async (processId, userId) => {
    return Processes.findOneAndUpdate({ _id: processId }, { $set: { updated_by: userId } });
}

const updateCreatedBy = async (processId, userId) => {
    return Processes.findOneAndUpdate({ _id: processId }, { $set: { created_by: userId } });
}

const getProcessonProcessName = async (module, process_name) => {
    const processes = await Processes.find({ module: module, process_name: process_name });
    if (processes == []) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Processes")
    }
    return processes
}


module.exports = {
    createProcesses,
    listAllProcesses,
    getProcessOnModuleName,
    processById,
    updateProcessOnId,
    deleteProcessOnId,
    updateUpdatedBy,
    updateCreatedBy,
    getProcessonProcessName
}