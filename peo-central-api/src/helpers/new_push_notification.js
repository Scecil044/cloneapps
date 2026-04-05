const admin = require('firebase-admin');

// const serviceAccount = require('../config/hr-direct-3584f-firebase-adminsdk-o82qb-62316381a5.json');

const serviceAccount = require('../config/peo-central-firebase-adminsdk-ertbe-08b89bb7f6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Push a notification to a single device
 * @param {Object} financeBody,
 * @returns {Promise<Object>}
 */
const sendPush = async (sub_id, title, body, data,) => {
console.log("------------>start of new push notification----------->")
  const notification = {
    title,
    body,
  };
  const message = {
    data,
    topic: sub_id,
    notification,
    "android": {
      "collapseKey": "col_key",
      "notification": notification,
      "ttl": 9000,
    },
    "apns": {
      "payload": {
        "aps": {
          "category": "NEW_MESSAGE_CATEGORY"
        }, "apns-collapse-id": "new col kery"

      },
    }
  };
  const createRes = await admin.messaging().send(message);
  console.log(createRes, "notification response-------------->");
  return createRes;
};

module.exports = {
  sendPush,
};