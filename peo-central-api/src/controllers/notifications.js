"use strict";

const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// Configuration for the notification service
const config = {
    baseUrl: process.env.Micro_Service_Url,
    Api_key: process.env.Micro_Service_API_KEY
  };

  // Function to send an email
  async function sendEmailfromMs(emailDetails) {
    try {
      const response = await axios.post(
        `${config.baseUrl}/emails/send-email`,
        emailDetails,
        {
          headers: {
            'Authorization': `Api_key ${process.env.Micro_Service_API_KEY}`,
          },
        }
      );
      console.log('Email sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending email:', error.response ? error.response.data : error.message);
    }
  }

  // Function to send an SMS
  async function sendSms(smsDetails) {
    try {
      const response = await axios.post(
        `${config.baseUrl}/sms/send-sms`,
        smsDetails,
        {
          headers: {
            'Authorization': `Bearer ${config.Api_key}`,
          },
        }
      );
      console.log('SMS sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    }
  }

  // Function to send a portal notification
  async function sendPortalNotification(notificationDetails) {
    try {
      const response = await axios.post(
        `${config.baseUrl}/notification/send-portal-notification`,
        notificationDetails,
        {
          headers: {
            'Authorization': `Bearer ${config.Api_key}`,
          },
        }
      );
      console.log('Portal notification sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending portal notification:', error.response ? error.response.data : error.message);
    }
  }

  // Example usage
  const emailDetails = {

        email_address: "donotreply@nathanhr.ae",
        receiver_email: "david@nathandigital.com",
        subject: "testing email",
        text: "Hello world, this is my new email as we try it out to be what it is",
        html: "Hello world, this is my new email as we try it out to be what it is",
        cc: ""
        // "attachments": [
        //     {
        //         "filename": "image.jpg",
        //         "path": "https://nathanhr.com"
        //     }
        // ]

  };

  const smsDetails = {
    senderAddr: 'SENDER',
    dndCategory: '1',
    expiryDt: '2024-06-30T00:00:00Z',
    desc: 'Test SMS',
    campaignName: 'Test Campaign',
    recipient: ['+254741712131'],
    msg: 'This is a test SMS',
    wapUrl: '',
  };

  const notificationDetails = {
    channel: 'CHANNEL_ID',
    body: {
      title: 'Test Notification',
      message: 'This is a test portal notification',
    },
  };

  // Send notifications
//   sendEmail(emailDetails);
//   sendSms(smsDetails);
//   sendPortalNotification(notificationDetails);

async function sendNotification(userId, title, body,product) {
  try {
    console.log("======================= sending notification ========================================================================")
    const url = `${process.env.Micro_Service_Url}/webpusher/sendNotification`;
    const headers = {
      'Content-Type': 'application/json',
    };

    const data = {
      userId,
      title,
      body,
      product
    };

    // console.log("final data sent", data)
    const response = await axios.post(url, data, { headers });
    console.log('push response', response.data)
    if (response.data.success) {
      console.log('Notification sent successfully');
    } else {
      console.error('Failed to send notification:', response.data.message);
    }
  } catch (error) {
    console.log("Could not add push notification: ", error.message)
    // console.error('Error sending notification:', error.data.message);
  }
}

  module.exports={
    sendEmailfromMs,
    sendSms,
    sendPortalNotification,
    sendNotification

  }
