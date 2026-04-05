const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { logRequestBody, getUserId } = require('../utils/reqUtils');
const logger = require('../middlewares/logger');
const { loggerService, claimConfigService  } = require("../services");


const create = catchAsync(async (req, res) => {
    try {
        const data = await claimConfigService.createClaimConfig(req.body)
        const logString = (logger.info(`${req.userId} Created a claim config with data ${req.body}`)).transports[0].logString;
        await loggerService.createLogger('claimconfigs', req.userId, logString);
        res.status(httpStatus.CREATED).send({success: true, message: 'Successfully created claim config.', data});
    } catch (error) {
        const logString = (logger.error(`${req.userId} Failed to Create Claim Config, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claimconfigs', req.userId, logString);
        res.status(400).send({success: false, message: 'Failed created claim config.', error});
    }
});

const update = catchAsync(async (req, res) => {
    if (Object.keys(req.body).length === 0) res.status(400).send({success: false, message: 'Please provide valid data.', error})
    try {
        const { company_ID } = req.params;
        const data = await claimConfigService.updateClaimConfig(company_ID, req.body)
        const logString = (logger.info(`${req.userId} Update a claim config with company Id ${company_ID}`)).transports[0].logString;
        await loggerService.createLogger('claimconfigs', req.userId, logString);
        res.status(httpStatus.CREATED).send({success: true, message: 'Successfully update claim config.', data});
    } catch (error) {
        const logString = (logger.error(`${req.userId} Failed to Update Claim Config, encountered following error => ${error}`)).transports[0].logString;
        await loggerService.createLogger('claimconfigs', req.userId, logString);
        res.status(500).send({success: false, message: 'Failed update claim config.', error});
    }
});


const remove = catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const data = await claimConfigService.removeByID(id)
        const logString = (logger.info(`${req.userId} Delete a claim config with Id ${id}`)).transports[0].logString;
        await loggerService.createLogger('claimconfigs', req.userId, logString);
        res.status(httpStatus.CREATED).send({success: true, message: 'Successfully deleted claim config.', data})
    } catch (error) {
        const logString = (logger.info(`${req.userId} Failed to delete claim config with Id ${id}`)).transports[0].logString;
        await loggerService.createLogger('claimconfigs', req.userId, logString);
        res.status(500).json({success: false, message: 'Failed to delete claim config.', error})
    }
})

const getClaimConfig = catchAsync(async (req, res) => {
  try {
          const data = await claimConfigService.getClaimConfigData(req.body)
          const logString = (logger.info(`${getUserId(req)} fetched claim config with data - ${logRequestBody(req)}`)).transports[0].logString;
          await loggerService.createLogger('claimconfigs', req.userId, logString);
          res.status(httpStatus.CREATED).send({success: true, message: 'Fetch claim config.', data})
      } catch (error) {
          const logString = (logger.info(`${getUserId(req)} failed fetch claim config with data - ${logRequestBody(req)}`)).transports[0].logString;
          await loggerService.createLogger('claimconfigs', req.userId, logString);
          res.status(500).send({success: false, message: 'Failed fetch claim config.', error})
      }
})



module.exports = {
  create,
  update,
  remove,
  getClaimConfig,
}