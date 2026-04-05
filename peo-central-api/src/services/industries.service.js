const { ObjectId } = require('mongodb');
const { Industry } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

/**
 * Create a new industry
 * @param {Object} industryBody
 * @returns {Promise<Industry>}
 */
const createIndustry = async (industryBody) => {
  try {
    // Check if industry with same name already exists
    const existingIndustry = await Industry.findOne({
      industry_name: industryBody.industry_name,
      is_deleted: false
    });

    if (existingIndustry) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Industry with this name already exists');
    }

    const industry = await Industry.create(industryBody);
    return industry;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Get industry by id
 * @param {ObjectId} id
 * @returns {Promise<Industry>}
 */
const getIndustryById = async (id) => {
  try {
    const industry = await Industry.findOne({ _id: ObjectId(id), is_deleted: false });
    if (!industry) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Industry not found');
    }
    return industry;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Update industry by id
 * @param {ObjectId} industryId
 * @param {Object} updateBody
 * @returns {Promise<Industry>}
 */
const updateIndustryById = async (industryId, updateBody) => {
  try {
    const industry = await getIndustryById(industryId);

    // Check if updated name already exists
    if (updateBody.industry_name) {
      const nameExists = await Industry.findOne({
        industry_name: updateBody.industry_name,
        _id: { $ne: ObjectId(industryId) },
        is_deleted: false
      });

      if (nameExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Industry name already exists');
      }
    }

    Object.assign(industry, updateBody);
    await industry.save();
    return industry;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Delete industry by id
 * @param {ObjectId} industryId
 * @param {ObjectId} userId - ID of user performing the deletion
 * @returns {Promise<Industry>}
 */
const deleteIndustryById = async (industryId, userId) => {
  try {
    const industry = await getIndustryById(industryId);

    industry.is_deleted = true;
    industry.deleted_by = userId;
    await industry.save();

    return industry;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * Get all industries with pagination and filtering
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryIndustries = async (reqQuery) => {
  try {
      const options= {
            limit: reqQuery.limit ? parseInt(reqQuery.limit, 10) : 100,
            page: reqQuery.page ? parseInt(reqQuery.page, 10) : 1,
            sortBy: reqQuery.sortBy ? reqQuery.sortBy : 'industry_name:1',
        }
        let searchRegex;
        const filter= {
            is_deleted: false
        }
        if(reqQuery.search && reqQuery.search !== '') {
          searchRegex = new RegExp(reqQuery.search, 'i');
          filter.$or= [
            { industry_name: { $regex: searchRegex } },]
        }

    // Use the paginateLookup plugin to handle pagination with aggregation
    const result = await Industry.paginate(filter, options)

    return result;
  } catch (error) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createIndustry,
  getIndustryById,
  updateIndustryById,
  deleteIndustryById,
  queryIndustries,
};
