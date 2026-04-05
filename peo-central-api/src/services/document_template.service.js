const { ObjectId } = require("mongodb");
const { DocumentTemplate } = require("../models")
const httpStatus = require("http-status")
const ApiError = require('../utils/ApiError');
const _ = require('lodash')

const getDocTemplatesOnID = async (templateId) => {
    let documentTemplate = await DocumentTemplate.findById({ "_id": ObjectId(templateId) })
    if (!documentTemplate) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Document Template for the given ID")
    }
    return documentTemplate
}

const getDocTemplatesOnCondition = async (condition) => {
   try{
    console.log(condition , "Cond is the condition found")
    let documentTemplate = await DocumentTemplate.findOne(condition)
    if (!documentTemplate) {
        console.log("this is the error now")
        // throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Document Template for the given ID")
        throw new Error("Cannot find Document Template for the given ID");
    }
    console.log(documentTemplate, 'documentTemplate... this is the 777777 template')
    return documentTemplate
   }catch(error){
    console.log(error);
    throw new Error(error);
   }
}

const addNewDocumentTemplate = async (body) => {
    const newTemplate = new DocumentTemplate(body)
    return await newTemplate.save()
}

const listAllDocumentTemplates = async () => {
    const result = await DocumentTemplate.find({ is_deleted: false }).select({_id:1,name:1,module:1});
    if (result.length  < 1) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot find Documents Templates")
    }
    return result
}

const deleteDocumentTemplate = async (templateId) => {
    let result = await DocumentTemplate.findByIdAndUpdate({ "_id": ObjectId(templateId) }, { is_deleted: true })
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Cannot delete Document Template")
    }
    return result
}

const updateDocumentTemplateOnId = async (templateId, updateBody) => {
    const result = await getDocTemplatesOnID(templateId);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Document Template Not found');
    }
    return DocumentTemplate.findOneAndUpdate({ _id: templateId }, { $set: updateBody }, { new: true });
}

const updateUpdatedBy = async (templateId, userId) => {
    return DocumentTemplate.findOneAndUpdate({ _id: templateId }, { $set: { updated_by: userId } });
}

const updateCreatedBy = async (templateId, userId) => {
    return DocumentTemplate.findOneAndUpdate({ _id: templateId }, { $set: { created_by: userId } });
}

module.exports = {
    addNewDocumentTemplate,
    getDocTemplatesOnID,
    listAllDocumentTemplates,
    deleteDocumentTemplate,
    updateDocumentTemplateOnId,
    updateUpdatedBy,
    updateCreatedBy, 
    getDocTemplatesOnCondition
}