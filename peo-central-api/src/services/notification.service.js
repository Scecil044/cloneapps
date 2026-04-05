const { ObjectId } = require('mongodb');

const httpStatus = require('http-status');
const { Notification, Companies, Documents } = require('../models');
const { sortOrder } = require('../helpers/common');
const ApiError = require('../utils/ApiError');
const firebaseService = require('./firebase.service');
const emailTemplateService = require("./email_template.service");

// find notification by notification id
const getNotificationById = async(notificationId) => {
  try {
    const isNotification = await Notification.findById(notificationId);
    if (!isNotification) throw new Error(`Could not get notification with the provided id ${notificationId}`);
    return isNotification;
  } catch(error) {
  }
}
// function to get all system notifications
const getAllNotifications = async reqQuery => {
  const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
  const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 20;
  const sort = reqQuery.sort ? parseInt(reqQuery.sort) : -1;
  const sortBy = reqQuery.sortBy || 'createdAt';
  const skip = (page - 1) * limit;

  const notifications = await Notification.find()
    .limit(limit)
    .skip(skip)
    .sort({ [sortBy]: sort });
  if (!notifications || notifications.length === 0) {
    return { message: 'Unable to list system notifications' };
  }
  return { message: 'success', data: notifications };
};

// Get Notification on User ID
// const getNotificationsOnUserId = async (userId, query) => {
//   const { search } = query;
//   const page = reqQuery.page ? parseInt(reqQuery.page) : 1;
//   const limit = reqQuery.limit ? parseInt(reqQuery.limit) : 20;
//   const sort = reqQuery.sort ? parseInt(reqQuery.sort) : -1;
//   const sortBy = reqQuery.sortBy || 'createdAt';
//   const skip = (page - 1) * limit;

//   const pipeline = [
//     { $match: { user_id: userId } }
//   ];

//   // optionally add search if provided on query
//   if (search) {
//     pipeline.push({
//       $match: {
//         notification_text: { $regex: search, $options: 'i' } // Case-insensitive search
//       }
//     });
//   }

//   const notifications = await Notification.aggregate(pipeline);
//   if (!notifications || notifications.length === 0) {
//     return { message: 'Unable to find Notifications.', data: [] };
//   }
//   return { message: 'Success', data: notifications };
// };
const getNotificationsOnUserId = async (userId, reqQuery) => {
  const { search, page = 1, limit = 20, sort = -1, sortBy = 'createdAt' } = reqQuery;
  const skip = (page - 1) * limit;

  const pipeline = [{ $match: { user_id: userId } }];

  // Optionally add search if provided on query
  if (search) {
    pipeline.push({
      $match: {
        notification_text: { $regex: search, $options: 'i' } // Case-insensitive search
      }
    });
  }

  // Add sorting
  pipeline.push({ $sort: { [sortBy]: sort } });

  // Add pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  try {
    const notifications = await Notification.aggregate(pipeline);

    if (!notifications || notifications.length === 0) {
      return { message: 'No notifications found.', data: [] };
    }

    const totalCount = await Notification.countDocuments(pipeline[0].$match);

    return {
      message: 'Success',
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { message: 'Error fetching notifications', error: error.message };
  }
};
// Update Notification On Id
const updateNotificationOnId = async (reqBody, notificationId, userId) => {
  const updateNotificationBody = {
    ...reqBody,
    updated_by: userId
  };
  const updatedNotification = await Notification.findOneAndUpdate(
    { _id: ObjectId(notificationId) },
    { $set: updateNotificationBody }
  );
  if (!updatedNotification || updatedNotification.length === 0) {
    return { message: 'Unable to Update Notification.', data: [] };
  }
  return { message: 'Success', data: updatedNotification };
};

// Create a new Notification
const createNewNotification = async (reqBody, userId) => {
  const notificationBody = new Notification({
    ...reqBody,
    created_by: userId
  });
  const newNotification = await notificationBody.save();
  if (!newNotification) {
    return { message: 'Unable to Create new Notification', data: [] };
  }
  return { message: 'Success', data: newNotification };
};

// Read All Notification
const readAllNotifications = async userId => {
  await Notification.updateMany({ user_id: userId, read_by: { $not: { $eq: userId } } }, { $push: { read_by: userId } });
  return { message: 'Updated Successfully', data: [] };
};

const readSingleNotification = async (userId, notificationId) => {
  await Notification.updateOne(
    { _id: notificationId, user_id: userId, read_by: { $not: { $eq: userId } } },
    { $push: { read_by: userId } }
  );
  return { message: 'Notification marked as read successfully', data: [] };
};

// Read All Socials Notification
const readAllSocialsNotifications = async userId => {
  await Notification.updateMany({ notification_type: 'New Social Post!' }, { $push: { read_by: userId } });
  return { message: 'Updated Successfully', data: [] };
};

// Read All Socials Updates
const readAllSocialsUpdatesNotification = async userId => {
  await Notification.updateMany({ user_id: userId, type: 'Social notification' }, { $push: { read_by: userId } });
  return { message: 'Updated Successfully', data: [] };
};

async function dispatchNotification(assigned_to = '', title = '', description = '', data = {}) {
  await firebaseService.dispatchNotification(assigned_to.toString(), title, description, 'high', data);
  const notification = new Notification({
    title: notification_type,
    description: notification_text,
    data,
    user_id: ObjectId(assigned_to)
  });
  const not = await notification.save();
  return not;
}

const fetchFlashNotifications = async (userId) => {
  try {
    const userNotifications = await Notification.find({
      user_id: userId,
      'flashNotifications.0': { $exists: true },
    });

    // Extract and flatten all flashNotifications from the found userNotifications
    const flashNotifications = userNotifications.flatMap(notification => 
      notification.flashNotifications.map(flash => ({
        ...flash.toObject(),
        notificationId: notification._id
      }))
    );

    return flashNotifications;
  } catch (error) {
    console.error("Error fetching flash notifications:", error);
    throw error;
  }
};

// function to change flash notification status
const markFlashNotificationAsRead = async (userId, notificationId, flashNotificationId) => {
  try {
    const notificationDoc = await getNotificationById(notificationId);
    
    // Find the specific flash notification
    const flashNotificationToUpdate = notificationDoc.flashNotifications.find(
      (item) => item._id.toString() === flashNotificationId
    );

    if (!flashNotificationToUpdate) {
      throw new Error('Flash notification not found');
    }

    // Update the 'isRead' property
    flashNotificationToUpdate.isRead = true;

    // Mark the flashNotifications array as modified
    notificationDoc.markModified('flashNotifications');

    // Save the updated notification document
    await notificationDoc.save();

    return flashNotificationToUpdate;
  } catch (error) {
    throw error; // No need to wrap the error in a new Error object
  }
};
const clientDocumentExpiryNotification = async(userId)=>{
  try {
    const allCompanies = await Companies.find({is_deleted: false});
    if (!allCompanies) throw new Error("some error");
    // extract company id's
    
   
  } catch (error){
    throw new Error(error);
  }
}

module.exports = {
  getAllNotifications,
  getNotificationsOnUserId,
  updateNotificationOnId,
  createNewNotification,
  readAllNotifications,
  readAllSocialsUpdatesNotification,
  readAllSocialsNotifications,
  dispatchNotification,
  readSingleNotification,
  fetchFlashNotifications,
  markFlashNotificationAsRead,
  clientDocumentExpiryNotification
};
