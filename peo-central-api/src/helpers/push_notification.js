
const axios = require('axios');

const push = async (sub_id, title, body, data = {}) => {
  console.log(sub_id, "is the subject id");
  console.log(title, "is the title")
  console.log(body, "is the body%%%%%%%%%%%%%%%%%%%%%")

  const url = 'https://fcm.googleapis.com/fcm/send';
  const dataArr = data;
  const notification = {
    'title': title,
    'body': body,
    "sound": "default"
  }
  const arrayToSend = {
    'to': `/topics/${sub_id}`,
    'notification': notification,
    'data': dataArr,
    'priority': 'high'
  };
  const fields = JSON.stringify(arrayToSend);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `key=AAAAYKsnNOU:APA91bHKHbmR57GsXVyKVbwf9jt2xRGCT1pYhSfozr5FjZNFOInOB1pqwfnZ6TUmLUH4l-6qDgrr0T-IiS-mjslZy2a0c5VpowkN83tpOXGyvDFrNdzvMWRddEZxCF7Yx5d6sP79ZGpx`
      // "Authorization": `AIzaSyBT-7Jc2K9UBlq2rTtyd7HF5NUOMVoWW24`
    }
  };

  const createRes = await axios.post(url, fields, config);
  console.log(createRes,"+++++++++++++++")
  return createRes;
}

const pushToMultipleIds = async (sub_id, title, body, ids, data = {}) => {

  const url = 'https://fcm.googleapis.com/fcm/send';
  const dataArr = data;
  const notification = {
    'title': title,
    'body': body,
    "_id": "",
    "sound": "default"
  }
  const arrayToSend = {
    'registration_ids': ids,
    'notification': notification,
    'data': dataArr,
    'priority': 'high'
  };
  const fields = JSON.stringify(arrayToSend);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `key=AAAAYKsnNOU:APA91bHKHbmR57GsXVyKVbwf9jt2xRGCT1pYhSfozr5FjZNFOInOB1pqwfnZ6TUmLUH4l-6qDgrr0T-IiS-mjslZy2a0c5VpowkN83tpOXGyvDFrNdzvMWRddEZxCF7Yx5d6sP79ZGpx`
    }
  };

  const createRes = await axios.post(url, fields, config);

  return createRes;
}

module.exports = {
  push,
  pushToMultipleIds
};