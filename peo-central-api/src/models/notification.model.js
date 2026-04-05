const mongoose = require('mongoose');

const fcm = require('../helpers/push_notification');
const fireb = require('../helpers/new_push_notification');
// const companyCode = "NNHRDIRECT-X_";
const companyCode = 'PEO_';
const { sendNotification } = require('../controllers/notifications');

const flashNotificationsSchema = new mongoose.Schema({
  title: { type: String },
  module: { type: String },
  text: { type: String },
  isRead: { type: Boolean, default: false },
});

const notificationsSchema = mongoose.Schema(
  {
    notification_type: {
      type: String
    },
    type: {
      type: Object
    },
    notification_text: {
      type: String
    },
    user_id: {
      type: Array
    },
    created_by: {
      type: String
    },
    updated_by: {
      type: String
    },
    url: {
      type: String
    },
    docId: {
      type: String
    },
    read_by: {
      type: Array
    },
    createdDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    flashNotifications: {
      type: [flashNotificationsSchema]
    }
  },
  {
    timestamps: true
  }
);

notificationsSchema.post('findOneAndUpdate', async function (doc, next) {
  try {
    if (doc.user_id.length > 0) {
      fcm.push(doc.user_id[0], doc.notification_type, doc.notification_text, {
        type: doc.notification_type,
        data: doc.type
      });
    }

    //
    // try {
    //     if (doc.user_id.length > 0) {
    //          sendNotification(doc.user_id[0], doc.notification_type, doc.notification_text, doc.type);
    //     }
    //
  } catch (err) {
    console.log(err);
  }

  next();
});

notificationsSchema.post('save', async function (doc, next) {
  try {
    let data = doc;
    var docId = '';
    if (data.docId) {
      docId = data.docId;
    }
    //PUSH NOTIFICATION SECTION
    if (data.user_id.length > 0) {
      if (data.docId) {
        console.log("^^^^^^^^^^^^^^^ running first condition for firebase notification ^^^^^^^^^^^^")
        fireb.sendPush(companyCode + data.user_id[0], data.notification_type, data.notification_text, {
          data: JSON.stringify({
            type: data.notification_type,
            data: data.type,
            docId: data.docId
          })
        });
      } else {
        console.log("^^^^^^^^^^^^^^running else condition for firebase notification ^^^^^^^^^^^^^^^^^^^^^^")
        fireb.sendPush(companyCode + data.user_id[0], data.notification_type, data.notification_text, {
          data: JSON.stringify({
            type: data.notification_type,
            data: data.type
          })
        });
      }
    }
    // try {
    //     if (doc.user_id.length > 0) {
    //          sendNotification(doc.user_id[0], 'This has been sent', doc.notification_text, doc.type);
    //     }
  } catch (err) {
    console.log(err);
  }
  next();
});

const Notifications = mongoose.model('Notifications', notificationsSchema);
module.exports = Notifications;
