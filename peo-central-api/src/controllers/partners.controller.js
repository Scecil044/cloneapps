const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const { partnershipsService } = require('../services');

const getPartnerById = catchAsync(async (req, res) => {
  try {
    const response = await partnershipsService.getPartnerById(req.params.partnerId);
    if (!response)
      throw new ApiError(httpStatus.BAD_REQUEST, `Could get partner with the provided id: ${req.params.partnerId}`);

    res.status(httpStatus.OK).json(response);
  } catch (error) {
    throw new Error(`An error was encountered with the following details: ${error}`);
  }
});

const createPartner = catchAsync(async (req, res) => {
  const response = await partnershipsService.createPartner(req.body, req.userId);
  if (!response) throw new ApiError(httpStatus.BAD_REQUEST, `Could not create partner`);

  res.status(httpStatus.OK).json(response);
});
/**
 * Function to update partner by id
 * expects partner id, request bbody and user id from request
 */
const updatePartnership = catchAsync(async (req, res) => {
  try {
    const response = await partnershipsService.updatePartnership(req.params.partnerId, req.body, req.userId);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update partnership');
    }

    res.status(httpStatus.OK).json(response);
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Function to delete partner by id
 * expects partner id and user id from request
 */
const deletePartnerById = catchAsync(async (req, res) => {
  const response = await partnershipsService.deletePartnerById(req.params.partnerId, req.userId);
  if (!response) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Unable to delete partner by the provided id ${req.params.PartnerId}`);
  }
  res.status(httpStatus.OK).json(response);
});

/**
 * Function to get partners
 * the function expects a query for filter
 */
const getPartners = catchAsync(async (req, res) => {
  const response = await partnershipsService.getPartners(req.query);
  if (!response) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Unable to get partners`);
  }
  res.status(httpStatus.OK).json(response);
});

// function to retun a count of partners based on contract status
const getPartnershipStats = catchAsync(async (req, res) => {
  try {
    const response = await partnershipsService.getPartnershipStats(req.query);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Unable to get partners`);
    }
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    throw new Error(error);
  }
});

const bulkUploadPartners = catchAsync(async (req, res) => {
  try {
    const response = await partnershipsService.bulkUploadPartners(req);
    if (!response) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Unable to upload partners`);
    }
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

module.exports = {
  updatePartnership,
  deletePartnerById,
  getPartners,
  createPartner,
  getPartnerById,
  getPartnershipStats,
  bulkUploadPartners
};
