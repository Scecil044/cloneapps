const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { notificationService } = require('../services');

/**
 * ================================================================================================================
 * The controller functins listed here trigger firebase push notifications
 * See the implementation on pre save function on notifications model
 * ================================================================================================================
 */

// Get All Notifications
const getAllNotifications = catchAsync(async (req, res) => {
  try {
    const result = await notificationService.getAllNotifications(req.query);
    res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Get Notifications', error });
  }
});

// Get Notification on User ID
const getNotificationsOnUserId = catchAsync(async (req, res) => {
  try {
    const result = await notificationService.getNotificationsOnUserId(req?.params?.userId, req.query);
    res
      .status(httpStatus.OK)
      .json({ success: true, message: result?.message, data: result?.data, pagination: result?.pagination });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: 'Failed to Get Notifications', error });
  }
});

// Update Notification On Id
const updateNotificationOnId = catchAsync(async (req, res) => {
  try {
    const result = await notificationService.updateNotificationOnId(req?.body, req?.params?.notificationId, req?.userId);
    res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Update Notifications', error });
  }
});

// Create a new Notification
const createNewNotification = catchAsync(async (req, res) => {
  try {
    const result = await notificationService.createNewNotification(req?.body, req?.userId);
    res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Create Notification', error });
  }
});

// Read All Notification
const readAllNotifications = catchAsync(async (req, res) => {
  try {
    const result = await notificationService.readAllNotifications(req?.userId);
    res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Update', error });
  }
});

// Read single Notification
const readSingleNotification = catchAsync(async (req, res) => {
  try {
    const requiredFields = ['notificationId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) throw new Error(`Please provide the required fields: ${missingFields.join(', ')}`);
    const result = await notificationService.readSingleNotification(req?.userId, req.body.notificationId);
    res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: 'Failed to Update', error });
  }
});

// Read All Socials Notification
const readAllSocialsNotifications = catchAsync(async (req, res) => {
  try {
    const result = await notificationService.readAllSocialsNotifications(req?.userId);
    res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Update', error });
  }
});

// function to make ticket as complete
const readAllSocialsUpdatesNotification = catchAsync(async (req, res) => {
  try {
    const result = await notificationService.readAllSocialsUpdatesNotification(req?.userId);
    res.status(httpStatus.OK).json({ success: true, message: result?.message, data: result?.data });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to Update', error });
  }
});

const fetchFlashNotifications = catchAsync(async (req, res) => {
  try {
    const result = await notificationService.fetchFlashNotifications(req?.userId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch flash notifications by user id');
    }
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    throw new Error(error);
  }
});

/**
 * ================================================================================================================
 * The mark flash notifications as read function is used to mark flash notification as read
 * This feature has been implemented on mobile, but is still unavailable on web
 * It basically filters through flash notifications on Notification model and changes isRead flag
 * ================================================================================================================
 */
const markFlashNotificationAsRead = catchAsync(async (req, res) => {
  try {
    const result = await notificationService.markFlashNotificationAsRead(req?.userId, req.params.notificationId, req.params.flashNotificationId);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to mark flash notification as read');
    }
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  getAllNotifications,
  getNotificationsOnUserId,
  updateNotificationOnId,
  createNewNotification,
  readAllNotifications,
  readAllSocialsNotifications,
  readAllSocialsUpdatesNotification,
  readSingleNotification,
  fetchFlashNotifications,
  markFlashNotificationAsRead
};
