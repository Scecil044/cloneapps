const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  formService,
} = require('../services');


const getFilledForm = catchAsync(async (req, res) => {
  try{
    const employee = await formService.getFilledForm({ _id: req.query._id, foreign_id: req.query.foreign_id });
  res.status(httpStatus.OK).json({ 'data': employee });
  }catch(error){
    console.log(error)
  }
});

const getAllFields = catchAsync(async (req, res) => {
  const employee = await formService.getAllFields({ module: req.query.module });
  res.status(httpStatus.OK).json({ 'data': employee });
});

const fillForm = catchAsync(async (req, res) => {
  const employee = await formService.fillForm(req.body);
  res.status(httpStatus.OK).json({ 'data': employee });
});

const updateForm = catchAsync(async (req, res) => {
  const employee = await formService.updateForm(req.body);
  res.status(httpStatus.OK).json({ 'data': employee });
});

const getAllList = catchAsync(async (req, res) => {
  const forms = await formService.getAllList();
  res.status(httpStatus.OK).json(forms);
});

const getDropdownItems = catchAsync(async (req, res) => {
  const forms = await formService.getDropdownItems(req.query.keyword);
  res.status(httpStatus.OK).json(forms);
});

const getForm = catchAsync(async (req, res) => {
  const forms = await formService.getForm(req.query._id);
  res.status(httpStatus.OK).json(forms);
});

module.exports = {
  getDropdownItems,
  getFilledForm,
  fillForm,
  getAllList,
  getForm,
  getAllFields,
  updateForm
};
