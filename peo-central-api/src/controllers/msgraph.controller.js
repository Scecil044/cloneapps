const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const logger = require('../middlewares/logger');
const { msGraphService } = require('../services');

const fetchMailListing = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.fetchMailListing(req.userId, req.query);
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Sucessfully fetched email listing.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to fetch mail listing.', error: error?.message });
  }
});

const fetchMailFolders = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.fetchMailFolders(req.userId, req.query);
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Sucessfully fetched email folders.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to fetch mail listing.', error: error });
  }
});

const fetchEmailByFolder = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.fetchEmailByFolder(req.userId, req.query.folder_id, req.query);
    res
      .status(httpStatus.OK)
      .send({ status: 'ok', message: 'Sucessfully fetched email listing by folder.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to fetch mail listing.', error: error });
  }
});

const getMailById = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.getMailById(req.userId, req.params.mail_id);
    let attachments = await msGraphService.getMailAttachments(req.userId, response.id);
    response.attachments = attachments.value;
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Sucessfully fetched email.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to get email.', error: error });
  }
});

const getMailAttachments = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.getMailAttachments(req.userId, req.params.mail_id);
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Sucessfully fetched email attachments.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to get email attachments.', error: error });
  }
});

const searchMail = catchAsync(async (req, res) => {
  try {
    let response;
    if (['', undefined, null].includes(req.query.search)) {
      response = await msGraphService.fetchMailListing(req.userId, { skip: 0, limit: 20 });
    } else {
      response = await msGraphService.searchMail(req.userId, req.query.search);
    }
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Sucessfully searched email.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to search mail.', error: error });
  }
});

const sendMail = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.sendMail(req.userId, req.body);
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Sucessfully sent email.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to send mail.', error: error });
  }
});

const sendreplyToMail = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.sendreplyToMail(req.userId, req.params.mail_id, req.body);
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Sucessfully replied to email.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to reply mail.', error: error });
  }
});

const sendReplyAll = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.sendReplyAll(req.userId, req.params.mail_id, req.body.content);
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Sucessfully replied email to all.', data: response });
  } catch (error) {
    console.log(error);
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to reply mail to all.', error: error });
  }
});

const forwardMail = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.forwardMail(req.userId, req.params.mail_id, req.body);
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Sucessfully forwarded to email.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to forward mail.', error: error });
  }
});

const deleteMail = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.deleteMail(req.userId, req.params.mail_id);
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Email deleted successfully.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to delete mail.', error: error });
  }
});

const markEmailAsRead = catchAsync(async (req, res) => {
  try {
    let response = await msGraphService.markEmailAsRead(req.userId, req.params.mail_id);
    res.status(httpStatus.OK).send({ status: 'ok', message: 'Successfully marked email as read.', data: response });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ status: 'fail', message: 'Failed to mark email as read.', error: error });
  }
});

module.exports = {
  fetchMailListing,
  fetchMailFolders,
  fetchEmailByFolder,
  getMailById,
  getMailAttachments,
  searchMail,
  sendMail,
  sendreplyToMail,
  sendReplyAll,
  forwardMail,
  deleteMail,
  markEmailAsRead,
};
