const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { ticketingService, loggerService } = require('../services');
const logger = require('../middlewares/logger');

/**
 * function to get all tickets from the system
 */
const getAllTickets = catchAsync(async (req, res) => {
  try {
    const data = await ticketingService.getAllTickets(req.query);
    const logString = logger.info(`${req.userName} Accessed the route to get all tickets`).transports[0].logString;
    await loggerService.createLogger('Support', req.userId, logString);
    res.status(httpStatus.OK).json(data);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access the route to list all system tickets, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('Support', req.userId, logString);
    throw new Error(error);
  }
});

const ticketById = catchAsync(async (req, res) => {
  try {
    const data = await ticketingService.ticketById(req.params.ticketId);
    const logString = logger.info(`${req.userName} Accessed the route to get ticket by id`).transports[0].logString;
    await loggerService.createLogger('Support', req.userId, logString);

    res.status(httpStatus.OK).json(data);
  } catch (error) {
    const logString = logger.error(
      `${req.userName} Failed to Access the route to get ticket by ticket id, encountered following error => ${error}`
    ).transports[0].logString;
    await loggerService.createLogger('Support', req.userId, logString);
    throw new Error(error);
  }
});

/**
 *Function to get tickets by user id
 */
const ticketByUserId = catchAsync(async (req, res) => {
  try {
    const data = await ticketingService.ticketByUserId(req.params.userId, req.query);
    if (!data) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Unable to get tickets by user id ${req.params.userId}`);
    }
    res.status(httpStatus.OK).json(data);
  } catch (error) {
    throw new Error(error);
  }
});
/**
 *Function to create new ticket
 */
const createTicket = catchAsync(async (req, res) => {
  try {
    const requiredFields = ['type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0)
      throw new ApiError(httpStatus.BAD_REQUEST, `Please provide the required field(s): ${missingFields.join(', ')}`);
    // console.log(req.files, 'print for files');
    const data = await ticketingService.raiseTicket(req.body, req.files, req.userId);
    if (!data) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create ticket');
    }

    res.status(httpStatus.OK).json(data);
  } catch (error) {
    throw new Error(error.message);
  }
});

/**
 * Function to update ticket by ticket id
 */
const updateTicketMessageByTicketIdAndMessageId = catchAsync(async (req, res) => {
  try {
    const data = await ticketingService.updateTicket(
      req.params.ticketId,
      req.params.messageId,
      req.body.content,
      req.files,
      req.userId
    );
    if (!data) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update ticket');
    }

    res.status(httpStatus.OK).json(data);
  } catch (error) {
    throw new Error(error.message);
  }
});

const updateTicketByTicketId = catchAsync(async (req, res) => {
  try {
    const response = await ticketingService.updateById(req.params.ticketId, req.body, req.files, req.userId);
    if (!response) throw new Error(`Could not update ticket by provided id ${req.params.ticketId}`);

    res.status(httpStatus.OK).json(response);
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * Function to delete ticket by ticket id
 */
const deleteById = catchAsync(async (req, res) => {
  try {
    const data = await ticketingService.deleteById(req.params.tickerId);
    if (!data) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to delete ticket');
    }
    res.status(httpStatus.OK).json(data);
  } catch (error) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Unable to delete ticket by id. Please try again later', data: [], details: error.message });
  }
});

/**
 * Function to delete ticket by ticket id
 */
const ticketsbyCompanyId = catchAsync(async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.companyId)) {
      throw new Error(`Invalid company id ${req.params.companyId}`);
    }
    const data = await ticketingService.ticketsbyCompanyId(req.params.companyId, req.query, req.userId);

    if (!data) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get tickets by company id');
    }
    res.status(httpStatus.OK).json(data);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to get tickets by company id', details: error.message });
  }
});

const getAssignedTickets = catchAsync(async (req, res) => {
  try {
    const data = await ticketingService.getAssignedTickets(req.params.userId);
    if (!data) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get assigned tickets');
    }
    res.status(httpStatus.OK).json(data);
  } catch (error) {
    throw new Error(error);
  }
});

const attendToTicket = catchAsync(async (req, res) => {
  try {
    const response = await ticketingService.attendToTicket(req.params.ticketId, req.body, req.files, req.userId);
    // emit

    if (!response) throw new Error(`Unable to attend to ticket`);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    throw new Error(error);
  }
});

const marckTicketAsComplete = catchAsync(async (req, res) => {
 try{
  const response = await ticketingService.marckTicketAsComplete(req.params.ticketId, req.userId, req.roleName);
  if (!response) throw new Error(`Could not make ticket as complete`);

  res.status(httpStatus.OK).json(response);
 }catch(error){
  throw new Error(error);
 }
});

const markChatAsRead = catchAsync(async (req, res) => {
  const response = await ticketingService.markChatAsRead(req.params.ticketId, req.userId);
  if (!response) throw new Error(`Could not make ticket as complete`);
  res.status(httpStatus.OK).json(response);
});

const removeAttachmentsFromTicketMessage = catchAsync(async (req, res) => {
  const response = await ticketingService.removeAttachmentsFromTicketMessage(
    req.params.ticketId,
    req.params.messageId,
    req.body,
    req.userId,
    req.roleName
  );
  if (!response) throw new Error(`Could not remove attachment from ticket`);

  res.status(httpStatus.OK).json(response);
});
// function to reassign ticket
const reassignTicket = catchAsync(async (req, res) => {
  try {
    const response = await ticketingService.reassignTicket(
      req.params.ticketId,
      req.userId,
      req.body.assignToId,
      req.roleName
    );
    if (!response) throw new Error(`Could not reassign ticket`);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    throw new Error(error);
  }
});
// get ticket stats
const ticketStats = catchAsync(async (req, res) => {
  try {
    const response = await ticketingService.ticketStats(req.body);
    if (!response) throw new Error(`Could not get ticket stats`);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    throw new Error(error);
  }
});

const sendSampleNotification = catchAsync(async (req, res) => {
  try {
    const response = await ticketingService.sendPushNotification(req.body.userId);
    // if (!response) throw new Error(`Could not get ticket stats`);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  getAllTickets,
  ticketById,
  ticketByUserId,
  createTicket,
  updateTicketMessageByTicketIdAndMessageId,
  deleteById,
  getAssignedTickets,
  ticketsbyCompanyId,
  attendToTicket,
  updateTicketByTicketId,
  marckTicketAsComplete,
  markChatAsRead,
  removeAttachmentsFromTicketMessage,
  reassignTicket,
  ticketStats,
  sendSampleNotification,
};
