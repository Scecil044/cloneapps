const express = require('express');

const router = express.Router();
const { notificationController } = require('../../controllers');
const verifyToken = require('../../middlewares/verifyToken');
const validate = require('../../middlewares/validate');
const { notificationValidation } = require('../../validations');

/**
 * ============================================================================================
 
 * While these routes work correctly,
 * their respective validators have not been fully implemented.
 
 * ============================================================================================
 */

router.route('/all').all(verifyToken).get(notificationController.getAllNotifications);

router.route('/flash/notifications').all(verifyToken).get(notificationController.fetchFlashNotifications);

router.route('/read/flash/notification/:notificationId/:flashNotificationId').all(verifyToken).put(notificationController.markFlashNotificationAsRead);

router.route('/user/:userId').all(verifyToken).get(notificationController.getNotificationsOnUserId);

router.route('/update/:notificationId').all(verifyToken).put(notificationController.updateNotificationOnId);

router.route('/new').all(verifyToken).post(notificationController.createNewNotification);

router.route('/user/read_all').all(verifyToken).put(notificationController.readAllNotifications);

router.route('/user/read').all(verifyToken).put(notificationController.readSingleNotification);

router.route('/user/read_all_socials').all(verifyToken).put(notificationController.readAllSocialsNotifications);

router
  .route('/user/read_all_socials_updates')
  .all(verifyToken)
  .put(notificationController.readAllSocialsUpdatesNotification);

module.exports = router;
