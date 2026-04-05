const { ObjectId } = require('mongodb');
const { DocumentTypes } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const createDocumentType = async (documentBody) => {
  let newDocument = new DocumentTypes(documentBody);
  return await newDocument.save();
};

const updateDocumentTypeOnId = async (documentId, updateDocumentBody) => {
  const documentResult = await documentTypeById(documentId);
  if (!documentResult) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Document Type Not found');
  }
  return DocumentTypes.findOneAndUpdate({ _id: documentId }, { $set: updateDocumentBody }, { new: true });
};

const updateUpdatedBy = async (documentId, userId) => {
  return DocumentTypes.findOneAndUpdate({ _id: documentId }, { $set: { updated_by: userId } });
};

const updateCreatedBy = async (documentId, userId) => {
  return DocumentTypes.findOneAndUpdate({ _id: documentId }, { $set: { created_by: userId } });
};

const listAllDocumentTypes = async (parsedQuery) => {
  const filter = {
    is_deleted: false,
  };

  // Add search functionality if search parameter is provided
  if (parsedQuery.search) {
    filter.name = { $regex: parsedQuery.search, $options: 'i' };
  }

  const limit = parsedQuery.limit ? parseInt(parsedQuery.limit, 10) : 10000;
  const pages = parsedQuery.page ? parseInt(parsedQuery.page, 10) : 1;
  const skip = (pages - 1) * limit;

  const options = {
    limit,
    pages,
    skip,
  };
  const documents = await DocumentTypes.find(filter, null, options);
  // console.log(documents.length);
  if (!documents) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Document Types');
  }
  return documents;
};

const documentTypeById = async (documentId) => {
  let documents = await DocumentTypes.findById({ _id: ObjectId(documentId) });
  if (!documents) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Document Type');
  }
  return documents;
};

const deleteDocumentType = async (documentId) => {
  let documents = await DocumentTypes.findByIdAndUpdate({ _id: ObjectId(documentId) }, { is_deleted: true });
  if (!documents) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete Document Type');
  }
  return documents;
};

const getDocumentTypeOnTheType = async (type) => {
  let documents = await DocumentTypes.find({ type: type });
  if (!documents) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Document Type');
  }
  return documents;
};

const getDocumentList = async (list) => {
  let documents = await DocumentTypes.find({ _id: { $in: list } });
  if (!documents) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find Document Type');
  }
  return documents;
};

module.exports = {
  createDocumentType,
  updateDocumentTypeOnId,
  updateUpdatedBy,
  updateCreatedBy,
  listAllDocumentTypes,
  documentTypeById,
  deleteDocumentType,
  getDocumentTypeOnTheType,
  getDocumentList,
};
