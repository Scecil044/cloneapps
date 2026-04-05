const { taxCodeService, loggerService } = require('../services')
const httpStatus = require("http-status");
const logger = require('../middlewares/logger');
const catchAsync = require("../utils/catchAsync")

const findTaxCodeById = catchAsync(async(req, res)=>{
    try{
        const response = await taxCodeService.findTaxCodeById(req.params.taxId);
        const logString = logger.info(`${req.userName} Accessed the find tax code by od route`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = logger.error(`${req.userName} Failled to get tax code by id ${req.taxId}. Encountered the following error=>${error?.message}`)
        .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error(error);
    }
})

const createTaxCode = catchAsync(async(req, res)=>{
    try {
        const response = await taxCodeService.createTaxCode(req.body);
        const logString = logger.info(`${req.userName} Accessed create tax code route`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
            const logString = logger.error(`${req.userName} Failled to create a new tax code. Encountered the following error=>${error?.message}`)
        .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error(error);
    }
});

const listAllTaxCodes = catchAsync(async (req, res) => {
    try {
        const result = await taxCodeService.listAllTaxCodes();
        const logString = logger.info(`${req.userName} Accessed all taxtes route`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).send(result)
    } catch (error) {
        const logString = logger.error(`${req.userName} Failled to list all tax codes. Encountered the following error=>${error?.message}`)
        .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error(error);
    }
});

const updateTaxCode = catchAsync(async(req, res)=>{
    try {
        const response = await taxCodeService.updateTaxCode(req.body, req.params.taxId);
        const logString = logger.info(`${req.userName} Accessed update tax code  route`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
            const logString = logger.error(`${req.userName} Failled to update tax code ${req.params.taxId}. Encountered the following error=>${error?.message}`)
        .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error(error);
    }
});

const deleteTaxCode = catchAsync(async(req, res)=>{
    try {
        const response = await taxCodeService.deleteTaxCode( req.params.taxId);
        const logString = logger.info(`${req.userName} Accessed delete tax code  route for tax code ${req.params.taxId}`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).json({message:'Tax code deleted successfully', success: true});
    }catch(error){
            const logString = logger.error(`${req.userName} Failled to delete tax code ${req.params.taxId}. Encountered the following error=>${error?.message}`)
        .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        throw new Error(error);
    }
});

module.exports = {
    listAllTaxCodes,
    createTaxCode,
    deleteTaxCode,
    updateTaxCode,
    findTaxCodeById
}