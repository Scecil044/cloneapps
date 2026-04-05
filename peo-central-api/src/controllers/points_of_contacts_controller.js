const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const logger = require('../middlewares/logger');
const { pointOfContactsService, loggerService } = require('../services');

const createNewPointOfContact = catchAsync(async(req,res)=>{
    try{
            const response = await pointOfContactsService.createNewPointOfContact(req.body, req.userId);
            const logString = logger.info(`${req.userName} Accessed the route to create new point of contact`).transports[0].logString;
            await loggerService.createLogger('users', req.userId, logString);
            res.status(httpStatus.OK).json(response);
    }catch(error){
            const logString = logger.error(`${req.userName} Failed to create new point of contact => ${error?.message}`)
              .transports[0].logString;
            await loggerService.createLogger('users', req.userId, logString);
            res.status(400).json({ message: 'Failed to create new point of contact', details: error?.message });
    }
});

const updatePointOfContact = catchAsync(async(req,res)=>{
    try{
        const response = await pointOfContactsService.updatePointOfContact(req.body, req.params.pocId, req.userId);
        const logString = logger.info(`${req.userName} Accessed the route to update point of contact`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = logger.error(`${req.userName} Failed to update point of contact => ${error?.message}`)
          .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(400).json({ message: 'Failed to update point of contact', details: error?.message });
    }
})

const updatePocProfile = catchAsync(async(req,res)=>{
    try{
        // For POC profile update, the POC ID is the user ID from the token
        const response = await pointOfContactsService.updatePointOfContact(req.body, req.userId, req.userId);
        const logString = logger.info(`${req.userName} Updated their POC profile`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = logger.error(`${req.userName} Failed to update POC profile => ${error?.message}`)
          .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(400).json({ message: 'Failed to update POC profile', details: error?.message });
    }
})


const fatchPointOfContacts  = catchAsync(async(req,res)=>{
    try{
        const response = await pointOfContactsService.fetchPointOfContacts(req.query);
        const logString = logger.info(`${req.userName} Accessed the route to fetch point of contacts`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = logger.error(`${req.userName} Failed to fetch point of contacts => ${error?.message}`)
          .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch point of contacts', details: error?.message });
    }
})

const getPointsOfContactStats = catchAsync(async(req,res)=>{
    try{
        const response = await pointOfContactsService.getPointsOfContactStats();
        const logString = logger.info(`${req.userName} Accessed the route to fetch points of contact stats`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = logger.error(`${req.userName} Failed to fetch points of contact stats => ${error?.message}`)
          .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch points of contact stats', details: error?.message });
    }
})

const fetchPocEmails = catchAsync(async(req,res)=>{
    try{
        const response = await pointOfContactsService.fetchPocEmails(req.body);
        const logString = logger.info(`${req.userName} Accessed the route to fetch poc emails`).transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(httpStatus.OK).json(response);
    }catch(error){
        const logString = logger.error(`${req.userName} Failed to fetch poc emails => ${error?.message}`)
          .transports[0].logString;
        await loggerService.createLogger('users', req.userId, logString);
        res.status(400).json({ message: 'Failed to fetch poc emails', details: error?.message });
    }
})

module.exports = {
    createNewPointOfContact,
    updatePointOfContact,
    updatePocProfile,
    fatchPointOfContacts,
    getPointsOfContactStats,
    fetchPocEmails
}

