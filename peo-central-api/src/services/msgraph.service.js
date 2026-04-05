require('isomorphic-fetch');
const { Client } = require('@microsoft/microsoft-graph-client');

const MSAuthToken = require('../models/msauthtoken.model');

//Client Initialization for GRAPH API
let initClient = async (user_id) => {
  const authProvider = async (callback) => {
    try {
      let auth = await MSAuthToken.findOne({ user_id: user_id });
      if (!auth) throw new Error('Auth Failed.');
      callback(null, auth.accessToken);
    } catch (error) {
      console.log(error);
      callback(error, null);
    }
  };
  console.log('authProvider', authProvider);
  let options = {
    authProvider,
  };
  return Client.init(options);
};

const fetchMailListing = async (user_id, params) => {
  try{
    let client = await initClient(user_id);
  let data = await client
    .api('/me/mailFolders/inbox/messages')
    .top(params.limit)
    .skip(params.skip)
    .select('subject,sentDateTime,receivedDateTime,importance,isRead,from,sender,toRecipients')
    .get();
  return data;
  }catch(error){
    throw error
  }
};

const fetchMailFolders = async (user_id, queryObject) => {
  let client = await initClient(user_id);
  let data = await client.api('/me/mailFolders').top(100).get();
  return data;
};

const fetchEmailByFolder = async (user_id, folder_id, params) => {
  let client = await initClient(user_id);
  let data = await client
    .api(`/me/mailFolders/${folder_id}/messages`)
    .top(params.limit)
    .skip(params.skip)
    .select('subject,sentDateTime,receivedDateTime,importance,isRead,from,sender,toRecipients')
    .get();
  return data;
};

const getMailById = async (user_id, mail_id) => {
  let client = await initClient(user_id);
  let data = await client
    .api(`/me/messages/${mail_id}`)
    .select(
      'subject,sentDateTime,receivedDateTime,importance,isRead,from,sender,toRecipients,body,ccRecipients,bccRecipients,replyTo,flag'
    )
    .get();
  return data;
};

const getMailAttachments = async (user_id, mail_id) => {
  let client = await initClient(user_id);
  let data = await client.api(`/me/messages/${mail_id}/attachments`).get();
  return data;
};

const searchMail = async (user_id, search) => {
  let client = await initClient(user_id);
  let data = await client.api(`/me/messages`).search(search).get();
  return data;
};

const sendMail = async (user_id, emailPayload) => {
  let client = await initClient(user_id);

  if (emailPayload.attachments && emailPayload.attachments.length >= 1) {
    emailPayload.attachments = await Promise.all(
      emailPayload.attachments.map((el) => {
        return {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: el.name,
          contentType: el.contentType,
          contentBytes: el.contentBytes,
        };
      })
    );
  }

  emailPayload.recieverAddresses = await Promise.all(
    emailPayload.recieverAddresses.map((el) => {
      return {
        emailAddress: {
          address: el,
        },
      };
    })
  );

  emailPayload.ccAddresses = await Promise.all(
    emailPayload.ccAddresses.map((el) => {
      return {
        emailAddress: {
          address: el,
        },
      };
    })
  );

  let payloadBody = {
    message: {
      subject: emailPayload.subject,
      body: {
        contentType: 'HTML',
        content: emailPayload.content,
      },
      toRecipients: emailPayload.recieverAddresses,
      ccRecipients: emailPayload.ccAddresses,
      attachments: emailPayload.attachments,
    },
    saveToSentItems: 'true',
  };
  let data = await client.api('/me/sendMail').post(payloadBody);
  return data;
};

const sendreplyToMail = async (user_id, mail_id, emailPayload) => {
  let client = await initClient(user_id);
  emailPayload.recieverAddresses = await Promise.all(
    emailPayload.recieverAddresses.map((el) => {
      return {
        emailAddress: {
          address: el,
        },
      };
    })
  );

  let payloadBody = {
    message: {
      toRecipients: emailPayload.recieverAddresses,
    },
    comment: emailPayload.content,
  };

  let data = await client.api(`/me/messages/${mail_id}/reply`).post(payloadBody);
  return data;
};

const sendReplyAll = async (user_id, mail_id, comment) => {
  let client = await initClient(user_id);
  let payloadBody = { comment: comment };
  let data = await client.api(`/me/messages/${mail_id}/replyAll`).post(payloadBody);
  return data;
};

const forwardMail = async (user_id, mail_id, emailPayload) => {
  let client = await initClient(user_id);
  emailPayload.recieverAddresses = await Promise.all(
    emailPayload.recieverAddresses.map((el) => {
      return {
        emailAddress: {
          address: el,
        },
      };
    })
  );

  let payloadBody = {
    toRecipients: emailPayload.recieverAddresses,
    comment: emailPayload.content,
  };

  let data = await client.api(`/me/messages/${mail_id}/forward`).post(payloadBody);
  return data;
};

const deleteMail = async (user_id, mail_id) => {
  let client = await initClient(user_id);
  let data = await client.api(`/me/messages/${mail_id}`).delete();
  return data;
};

const markEmailAsRead = async (user_id, mail_id) => {
  let client = await initClient(user_id);
  let data = await client.api(`/me/messages/${mail_id}`).update({ isRead: true });
  return data;
};

module.exports = {
  fetchMailListing,
  fetchMailFolders,
  fetchEmailByFolder,
  getMailById,
  getMailAttachments,
  searchMail,
  sendMail,
  sendreplyToMail,
  sendReplyAll,
  forwardMail,
  deleteMail,
  markEmailAsRead,
};
