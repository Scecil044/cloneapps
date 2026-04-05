const httpStatus = require('http-status');
const { kycEnrollmentsService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const getKycEnrollmentByLeadId = catchAsync(async (req, res) => {
  const kycData = await kycEnrollmentsService.getKycEnrollmentByLeadId(req.params.leadId);
  res.status(httpStatus.OK).send(kycData);
});

const createKycEnrollment = catchAsync(async (req, res) => {
  const kycData = await kycEnrollmentsService.createKycEnrollment(req.body);
  res.status(httpStatus.CREATED).send(kycData);
});

const updateKycEnrollment = catchAsync(async (req, res) => {
  const kycData = await kycEnrollmentsService.updateKycEnrollment(req.params.leadId, req.body);
  res.status(httpStatus.OK).send(kycData);
});

const submitKycEnrollment = catchAsync(async (req, res) => {
  const kycData = await kycEnrollmentsService.submitKycEnrollment(req.params.leadId, req.body);
  res.status(httpStatus.OK).send(kycData);
});

const uploadKycDocuments = catchAsync(async (req, res) => {
  const urls = await kycEnrollmentsService.uploadKycDocuments(req.params.leadId, req.files);
  res.status(httpStatus.OK).send(urls);
});

module.exports = {
  getKycEnrollmentByLeadId,
  createKycEnrollment,
  updateKycEnrollment,
  submitKycEnrollment,
  uploadKycDocuments
};
