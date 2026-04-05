// const path = require('path');
// const { getMessaging } = require('firebase-admin/messaging');
// const { initializeApp, applicationDefault } = require('firebase-admin/app');

// if (['staging', 'development'].includes(process.env.NODE_ENV)) {
//   process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(
//     __dirname,
//     '../config/peo-central-firebase-adminsdk-ertbe-08b89bb7f6.json'
//   );
// }
// if (['preprod', 'production'].includes(process.env.NODE_ENV)) {
//   process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(
//     __dirname,
//     '../config/peo-central-firebase-adminsdk-ertbe-08b89bb7f6.json'
//   );
// }

// const firebaseApp = initializeApp({
//   credential: applicationDefault()
// });

// async function dispatchNotification(intendedUserId = '', title = '', message = '', priority = 'normal', data = {}) {
//   try {
//     const payload = {
//       notification: {
//         body: message,
//         title: title
//       },
//       topic: `PEOCENTRAL_${intendedUserId}`,
//       android: {
//         priority: priority
//       },
//       data: JSON.parse(JSON.stringify(data))
//     };

//     let res = await getMessaging(firebaseApp).send(payload);
//   } catch (error) {
//     console.log(error);
//   }
// }

// module.exports = {
//   dispatchNotification
// };
