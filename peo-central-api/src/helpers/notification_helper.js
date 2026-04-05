const NotificationsMessageModel = require('../models/notificationsmessage');

module.exports = {
    saveNotification: async (created_by, assigned_to, notification_text, notification_type, url, type, docId) => {
        let notificationMessage = new NotificationsMessageModel({
            notification_type: notification_type,
            type: type,
            notification_text: notification_text,
            user_id: assigned_to,
            created_by: created_by,
            url: url,
            read_by: [],
            docId: docId
        })

        return await notificationMessage.save();
    },
}