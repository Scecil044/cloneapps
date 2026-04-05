const mongoose = require("mongoose");

const fcm = require("../helpers/push_notification");
const fireb = require("../helpers/new_push_notification");
const companyCode = "PEO_";
const notificationsMessageSchema = mongoose.Schema({
  notification_type: {
    type: String,
  },
  type: {
    type: Object,
  },
  notification_text: {
    type: String,
  },
  user_id: {
    type: Array,
  },
  created_by: {
    type: String,
  },
  url: {
    type: String,
  },
  docId: {
    type: String,
  },
  read_by: {
    type: Array,
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

notificationsMessageSchema.post("findOneAndUpdate", async function (doc, next) {
  try {
    if (doc.user_id.length > 0) {
      fcm.push(doc.user_id[0], doc.notification_type, doc.notification_text, {
        type: doc.notification_type,
        data: doc.type,
      });
    }
  } catch (err) {
    console.log(err);
  }

  next();
});

notificationsMessageSchema.post("save", async function (doc, next) {
  try {
    let data = doc;
    var docId = "";
    if (data.docId) {
      docId = data.docId;
    }
    //PUSH NOTIFICATION SECTION
    if (data.user_id.length > 0) {
      if (data.docId) {
        fireb.sendPush(
          companyCode + data.user_id[0],
          data.notification_type,
          data.notification_text,
          {
            type: data.notification_type,
            data: data.type,
            docId: data.docId,
          }
        );
      } else {
        fcm.push(
          companyCode + data.user_id[0],
          data.notification_type,
          data.notification_text,
          {
            type: data.notification_type,
            data: data.type,
          }
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
  next();
});

const NotificationsMessage = mongoose.model("notificationsmessage", notificationsMessageSchema);
module.exports = NotificationsMessage;
