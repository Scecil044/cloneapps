const httpStatus = require('http-status');
const pick = require('../utils/pick');
const logger = require('../middlewares/logger');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {configurationService, loggerService} = require('../services');


const getconfig = catchAsync(async (req, res) => {
  const employee = await configurationService.getconfig({});
  res.status(httpStatus.OK).json({ 'data': employee });
});

const getmodules = catchAsync(async (req, res) => {
  const employee = await configurationService.getmodules(req.body);
  res.status(httpStatus.OK).json({ 'data': employee });
});
const getVisaSponsors = catchAsync(async (req, res) => {
  const employee = await configurationService.getVisaSponsors(req.body);
  res.status(httpStatus.OK).json({ 'data': employee });
});

/**
 * function to get list of all medical tawjeeh and eid centers based on query
 * Note that is nothing is passed on query it will list all the three
 */
const getMedicalTawheehAndEidCenters = catchAsync(async (req, res) => {
  const response = await configurationService.getMedicalTawheehAndEidCenters(req.query.center);
  res.status(httpStatus.OK).json({ 'data': response });
});

/**
 * Implementation to update products and services on the system
 * Note that this is saved on configurations model and only accepts products and services
 */
const updateProductsAndServices = catchAsync(async(req, res)=>{
  try{
    const response = await configurationService.updateProductsAndServices(req.body, req.userId);
    const logString = logger.info(`${req.userName} Updated products and services`).transports[0].logString;
    await loggerService.createLogger('configurations', req.userId, logString);
    res.status(httpStatus.OK).json(response);
  }catch(error){
    const logString = logger.error(`${req.userName} Failed to update products and services, encountered following error => ${error?.message}`)
      .transports[0].logString;
    await loggerService.createLogger('configurations', req.userId, logString);
    throw new Error(error);
  }
})
module.exports = {
  getconfig,
  getmodules,
  getVisaSponsors,
  getMedicalTawheehAndEidCenters,
  updateProductsAndServices
};
