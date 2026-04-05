const { ObjectId } = require('mongodb');

const moment = require('moment/moment');
const { startOfMonth } = require('date-fns');
const { Ticket, Users, emailTemplate, Notification, Poc, Role, Companies } = require('../models');
const companiesService = require('./companies.service');
const emailTemplateService = require('./email_template.service');
const ApiError = require('../utils/ApiError');
const { uploadFilesToS3 } = require('./aws.service');
const { escapeRegex } = require('../helpers/common');
const { sendRawEmail } = require('../middlewares/email');
const notificationService = require('./notification.service');
const webPush = require('../controllers/notifications');
const config = require('../config/config');
const queryService = require('./query.service');
// const socketApi = require("../config/socket");
const socketService = require('./socket.service');

const productId = config.webPush.notificationDbProductId;

const ticketById = async ticketId => {
  const ticket = await Ticket.findOne({ _id: ticketId, is_deleted: false })
    .populate({
      path: 'company_id',
      select: 'company_name logo'
    })
    .hint({ is_deleted: 1 });

  if (!ticket) return null;

  const populatedChats = await Promise.all(
    ticket.chats.map(async chat => {
      if (!chat.sender) return chat;

      let sender = await Users.findOne({ _id: chat.sender }, 'first_name last_name email image_url _id');

      if (!sender) {
        const pocSender = await Poc.findOne({ _id: chat.sender }, 'name email image_url _id');

        if (pocSender) {
          sender = {
            _id: pocSender._id,
            first_name: pocSender.name,
            last_name: '',
            email: pocSender.email,
            image_url: pocSender.image_url
          };
        }
      }

      return {
        ...chat.toObject(),
        sender: sender || chat.sender // Fall back to original sender if not found in either collection
      };
    })
  );

  const response = ticket.toObject();
  response.chats = populatedChats;
  return response;
};

/**
 * Function to create ticket
 */
const raiseTicketWorking = async (reqBody, files, userId) => {
  const { content, type, priority, anonymous, company_id } = reqBody;

  let ticketCount = await Ticket.countDocuments({ createdAt: { $gte: startOfMonth(new Date()) } });
  ticketCount += 1;
  ticketCount = ticketCount.toString().padStart(3, '0');
  const incident_number = `IN${moment().format('YYMM')}-${ticketCount}`;

  let attachments;

  // Create a new ticket
  const newTicket = await Ticket.create({
    participants: [userId],
    type,
    priority,
    anonymous,
    created_by: userId,
    status: 'New',
    incident_number,
    company_id
  });

  // Create a new message
  const message = {
    content,
    sender: userId,
    attachments: []
  };

  // Handle file attachments
  if (files && files.attachments) {
    const uploadedFiles = await uploadFilesToS3(files.attachments, newTicket._id);

    attachments = [...uploadedFiles];
    message.attachments = attachments;
  }

  // Add  message to the ticket's chats
  newTicket.chats.push(message);

  // Update last message and time
  newTicket.lastMessage = content;
  newTicket.lastMessageTime = new Date();

  const superAdminRole = await Role.findOne({ role_name: 'Super Admin' });
  const superAdmins = await Users.find({ role_ID: superAdminRole._id });
  const adminIds = superAdmins.map(admin => admin._id.toString());

  socketService.emitToUsers('new-ticket', newTicket, adminIds);

  const isUser = (await Users.findById(userId)) || (await Poc.findById(userId));
  if (!isUser) {
    throw new Error(`Invalid user id ${userId}`);
  }
  newTicket.company_id = isUser.company_id;
  await newTicket.save();

  const body = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Ticket Raised</title>
  <style>
    body {
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="">
    <div class="">
      <p>New Ticket Raised</p>
      <br/>
    </div>
    <div class="">
     <p>Dear ${isUser.first_name || isUser.name} ${isUser.last_name || ''},</p>
      <p>We are pleased to inform you that a new ticket has been successfully raised. Here are the details:</p>
      <p><strong>Ticket Type:</strong> ${newTicket.type}</p>
      <p><strong>Ticket Number:</strong> ${newTicket.incident_number}</p>
      <p><strong>Status:</strong> New</p>
      <p><strong>Description:</strong> ${newTicket.lastMessage}</p>
      <br/>
      <p>Thank you for reaching out to us!</p>
    </div>

  </div>
</body>
</html>
  `;
  const mailMessage = {
    to: [isUser.email],
    subject: 'Ticket Raised',
    body,
    cc: ['peosupport@nathanhr.com'],
    attachments: []
  };
  // send email notification
  sendRawEmail(mailMessage.to, mailMessage.subject, mailMessage.body, mailMessage.cc, mailMessage.attachments).then(
    async result => {
      console.log('Email sent successfully', sendRawEmail);
    }
  );

  const populatedTicket = await Ticket.findById(newTicket._id).populate({
    path: 'company_id',
    select: 'company_name logo'
  });

  if (!populatedTicket) return null;

  // Manually populate `chats.sender` from both Users and Poc models
  const populatedChats = await Promise.all(
    populatedTicket.chats.map(async chat => {
      if (!chat.sender) return chat;

      let sender = await Users.findOne({ _id: chat.sender }, 'first_name last_name email image_url _id');

      if (!sender) {
        const pocSender = await Poc.findOne({ _id: chat.sender }, 'name email image_url _id');

        if (pocSender) {
          sender = {
            _id: pocSender._id,
            first_name: pocSender.name,
            last_name: '',
            email: pocSender.email,
            image_url: pocSender.image_url
          };
        }
      }

      return {
        ...chat.toObject(),
        sender: sender || chat.sender // Fall back to original sender if not found
      };
    })
  );

  const response = populatedTicket.toObject();
  response.chats = populatedChats;
  return response;
};

const raiseTicket = async (reqBody, files, userId) => {
  try{
    const { content, type, priority, anonymous, company_id, assignToId } = reqBody;
  console.log(assignToId, "this is the assigned to id")
  let ticketCount = await Ticket.countDocuments({ createdAt: { $gte: startOfMonth(new Date()) } });
  ticketCount += 1;
  ticketCount = ticketCount.toString().padStart(3, '0');
  const incident_number = `IN${moment().format('YYMM')}-${ticketCount}`;

  let attachments;

  // Create participants array - initially just the creator
  const participants = [userId];

  // If assignToId is provided, verify the user exists and add to participants
  let assignedUser = null;
  if (assignToId) {
    assignedUser = await Users.findById(assignToId);
    if (!assignedUser) {
      throw new Error(`Invalid user id ${assignToId} for assignment`);
    }
    participants.push(assignToId);
  }

  // Create a new ticket
  const newTicket = await Ticket.create({
    participants,
    type,
    priority,
    anonymous,
    created_by: userId,
    status: assignToId ? 'Ongoing' : 'New', // Change status if directly assigned
    incident_number,
    company_id,
    assignedToId: assignToId || null
  });

  // Create a new message
  const message = {
    content,
    sender: userId,
    attachments: []
  };

  // Handle file attachments
  if (files && files.attachments) {
    const uploadedFiles = await uploadFilesToS3(files.attachments, newTicket._id);
    attachments = [...uploadedFiles];
    message.attachments = attachments;
  }

  // Add message to the ticket's chats
  newTicket.chats.push(message);

  // Update last message and time
  newTicket.lastMessage = content;
  newTicket.lastMessageTime = new Date();

  // Emit to super admins
  const superAdminRole = await Role.findOne({ role_name: 'Super Admin' });
  const superAdmins = await Users.find({ role_ID: superAdminRole._id });
  const adminIds = superAdmins.map(admin => admin._id.toString());

  socketService.emitToUsers('new-ticket', newTicket, adminIds);

  // If ticket is assigned, also emit to the assigned user
  if (assignToId) {
    socketService.emitToUsers('ticket-raised', newTicket, [assignToId.toString()]);
  }

  const isUser = (await Users.findById(userId)) || (await Poc.findById(userId));
  if (!isUser) {
    throw new Error(`Invalid user id ${userId}`);
  }
  newTicket.company_id = isUser.company_id;
  await newTicket.save();

  // Send email notification to ticket creator
  const body = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Ticket Raised</title>
  <style>
    body {
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="">
    <div class="">
      <p>New Ticket Raised</p>
      <br/>
    </div>
    <div class="">
     <p>Dear ${isUser.first_name || isUser.name} ${isUser.last_name || ''},</p>
      <p>We are pleased to inform you that a new ticket has been successfully raised. Here are the details:</p>
      <p><strong>Ticket Type:</strong> ${newTicket.type}</p>
      <p><strong>Ticket Number:</strong> ${newTicket.incident_number}</p>
      <p><strong>Status:</strong> ${newTicket.status}</p>
      <p><strong>Description:</strong> ${newTicket.lastMessage}</p>
      <br/>
      <p></p>
    </div>
  </div>
</body>
</html>
  `;
  const mailMessage = {
    to: [isUser.email],
    subject: 'Ticket Raised',
    body,
    cc: ['peosupport@nathanhr.com'],
    attachments: []
  };

  // Send email notification to ticket creator
  sendRawEmail(mailMessage.to, mailMessage.subject, mailMessage.body, mailMessage.cc, mailMessage.attachments).then(
    async result => {
      console.log('Email sent successfully', sendRawEmail);
    }
  );

  // If ticket is assigned, send notification to assigned user
  if (assignToId && assignedUser) {
    // Create notification
    const notificationBody = {
      notification_text: `You have been added as a participant on Ticket: ${newTicket.incident_number}`,
      notification_type: 'Support',
      user_id: [assignToId.toString()],
      flashNotifications: [
        {
          title: 'Ticket Raised',
          text: `You have been added as a participant on Ticket ${newTicket.incident_number} raised by ${
            isUser.first_name || isUser.name
          } ${isUser.last_name || ''}`,
          module: 'Tickets'
        }
      ]
    };

    await notificationService.createNewNotification(notificationBody, userId);

    // Send web push notification
    await webPush.sendNotification(
      assignToId,
      'New Ticket Raised',
      `You have been added as a participant on Ticket ${newTicket.incident_number}. Please check.`,
      productId
    );

    // Send email to assigned user - direct HTML construction instead of template
    if (assignedUser && assignedUser.email) {
      const companyName = isUser.company_id ? (await Companies.findById(isUser.company_id)).company_name : '';
      const assignedUserEmailBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Ticket Assignment</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
              font-size: 16px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
              margin-bottom: 20px;
            }
            .content {
              padding: 20px 0;
            }
            .ticket-details {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 4px;
              margin: 15px 0;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
              margin-top: 20px;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Ticket Assignment</h2>
            </div>
            <div class="content">
              <p>Dear ${assignedUser.first_name || assignedUser.name || ''} ${assignedUser.last_name || ''},</p>
              <p>You have been added as a participant to a new ticket raised by ${isUser.first_name || isUser.name || ''} ${isUser.last_name || ''}. Here are the details:</p>

              <div class="ticket-details">
                <p><strong>Ticket Number:</strong> ${newTicket.incident_number}</p>
                <p><strong>Ticket Type:</strong> ${newTicket.type}</p>
                <p><strong>Priority:</strong> ${newTicket.priority}</p>
                <p><strong>Status:</strong> ${newTicket.status}</p>
                <p><strong>Raised By:</strong> ${isUser.first_name || isUser.name || ''} ${isUser.last_name || ''}</p>
                ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ''}
                <p><strong>Description:</strong> ${newTicket.lastMessage}</p>
              </div>

              <p>Please review this ticket at your earliest convenience.</p>
              <p>Thank you for your attention to this matter.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendRawEmail(
        [assignedUser.email],
        `New Ticket Assignment: ${newTicket.incident_number}`,
        assignedUserEmailBody,
        [],
        []
      );
    }
  }

  const populatedTicket = await Ticket.findById(newTicket._id).populate({
    path: 'company_id',
    select: 'company_name logo'
  });

  if (!populatedTicket) return null;

  // Manually populate `chats.sender` from both Users and Poc models
  const populatedChats = await Promise.all(
    populatedTicket.chats.map(async chat => {
      if (!chat.sender) return chat;

      let sender = await Users.findOne({ _id: chat.sender }, 'first_name last_name email image_url _id');

      if (!sender) {
        const pocSender = await Poc.findOne({ _id: chat.sender }, 'name email image_url _id');

        if (pocSender) {
          sender = {
            _id: pocSender._id,
            first_name: pocSender.name,
            last_name: '',
            email: pocSender.email,
            image_url: pocSender.image_url
          };
        }
      }

      return {
        ...chat.toObject(),
        sender: sender || chat.sender // Fall back to original sender if not found
      };
    })
  );

  const response = populatedTicket.toObject();
  response.chats = populatedChats;
  return response;
  }catch(error){
    console.log(error)
    throw error
  }
};
const markChatAsRead = async (ticketId, userId) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Update isRead for all messages sent by others
  ticket.chats.forEach(chat => {
    if (chat.sender.toString() !== userId.toString()) {
      chat.isRead = true;
      chat.readBy = userId;
    }
  });

  ticket.markModified('chats');
  await ticket.save();

  // Refetch the ticket with company details
  const updatedTicket = await Ticket.findById(ticket._id)
    .populate({ path: 'company_id', select: 'company_name logo' })
    .lean(); // Convert to plain object for manual population

  // Manually populate sender details
  const populatedChats = await Promise.all(
    updatedTicket.chats.map(async chat => {
      if (!chat.sender) return chat;

      let sender = await Users.findOne({ _id: chat.sender }, 'first_name last_name email image_url _id');

      if (!sender) {
        const pocSender = await Poc.findOne({ _id: chat.sender }, 'name email image_url _id');

        if (pocSender) {
          sender = {
            _id: pocSender._id,
            first_name: pocSender.name,
            last_name: '',
            email: pocSender.email,
            image_url: pocSender.image_url
          };
        }
      }

      return {
        ...chat,
        sender: sender || chat.sender
      };
    })
  );

  updatedTicket.chats = populatedChats;
  return updatedTicket;
};

/**
 *  function to attend to ticket
 *  Functions as the function to address claims raised by client
 *  The flow of this function acts more like a chat
 */
const attendToTicket = async (ticketId, reqBody, files, userId) => {
  try {
    // Find the ticket by ID and populate participants
    let ticket = await Ticket.findById(ticketId).populate({
      path: 'participants',
      select: 'first_name last_name email image_url'
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Properly check for existing participant using ObjectId comparison
    const participantExists = ticket.participants.some(
      participant => (participant._id && participant._id.toString() === userId.toString()) || (participant && participant.toString() === userId.toString())
    );

    // Only add to participants if not already present
    if (!participantExists) {
      ticket.participants.push(userId);
    }

    // Get the updated indices after potential participant addition
    const firstParticipant = ticket.participants[0];
    const lastParticipantIndex = ticket.participants.length - 1;
    const lastParticipant = ticket.participants[lastParticipantIndex];

    // Check if current user is the first participant
    const isFirstParticipant =
      firstParticipant &&
      ((firstParticipant._id && firstParticipant._id.toString() === userId.toString()) || (firstParticipant && firstParticipant.toString() === userId.toString()));

    // Update ticket status and read status if not the first participant
    if (!isFirstParticipant) {
      ticket.status = 'Ongoing';
      ticket.chats.forEach(chat => {
        if (chat.sender && chat.sender.toString() !== userId.toString()) {
          chat.isRead = true;
        }
      });

      // Update flash notifications for the ticket with correct array update
      await Notification.updateMany(
        {
          user_id: { $in: [firstParticipant._id && firstParticipant._id.toString()] },
          flashNotifications: {
            $elemMatch: {
              module: 'Tickets',
              isRead: false,
              text: {
                $regex: ticket.incident_number,
                $options: 'i'
              }
            }
          }
        },
        {
          $set: {
            'flashNotifications.$[elem].isRead': true
          }
        },
        {
          arrayFilters: [
            {
              'elem.module': 'Tickets',
              'elem.isRead': false,
              'elem.text': {
                $regex: ticket.incident_number,
                $options: 'i'
              }
            }
          ],
          multi: true
        }
      );
    }

    // Create new message
    const message = {
      content: reqBody.content,
      sender: userId,
      attachments: reqBody.attachments ? reqBody.attachments : []
    };

    // Handle file attachments
    if (files && files.attachments) {
      const uploadedFiles = await uploadFilesToS3(files.attachments, ticket._id);
      message.attachments = [...uploadedFiles];
    }

    // Update ticket
    ticket.chats.push(message);
    ticket.lastMessage = reqBody.content;
    ticket.lastMessageTime = new Date();

    if (reqBody.status) {
      ticket.status = reqBody.status;
    }

    // Use the existing updateAssignedToId method
    ticket.assignedToId = userId;
    await ticket.save();

    // Get handler information
    if (!lastParticipant) {
      throw new Error('Handler not found');
    }

    // Create notification
    const notificationBody = {
      notification_text: `Ticket ${ticket.incident_number} is now being addressed`,
      notification_type: 'Support',
      user_id: firstParticipant ? [firstParticipant._id.toString()] : [],
      flashNotifications: [
        {
          title: 'Ticket Replied',
          text: `The issue raised on Ticket ${ticket.incident_number} is being addressed by ${lastParticipant.first_name} ${lastParticipant.last_name}`,
          module: 'Tickets'
        }
      ]
    };

    await notificationService.createNewNotification(notificationBody, userId);

    // Handle web push notifications
    if (firstParticipant && lastParticipant) {
      if (!isFirstParticipant) {
        await webPush.sendNotification(
          userId,
          'Ticket Replied',
          `${firstParticipant.first_name} ${firstParticipant.last_name} has responded to the last message sent on Ticket:${ticket.incident_number}`,
          productId
        );
      } else {
        await webPush.sendNotification(
          firstParticipant._id,
          'Ticket Replied',
          `Ticket ${ticket.incident_number} is being addressed by ${lastParticipant.first_name} ${lastParticipant.last_name}`,
          productId
        );
      }
    }

    let ticketResponse = await Ticket.findById(ticket._id).populate([
      { path: 'company_id', select: 'company_name logo' },
      { path: 'chats.sender', select: 'first_name last_name email image_url' }
    ]);
    // emit to customer
    const filteredRecipientIds = ticketResponse.participants.filter(participantId => participantId.toString() != userId);
    filteredRecipientIds.forEach(recipientId => {
      const lastChat = ticketResponse.chats[ticketResponse.chats.length - 1];
      ticketResponse.chats = [lastChat];
      socketService.getIO().emit(`message-${recipientId}`, ticketResponse);
    });

    // Return updated ticket with populated fields
    return ticketResponse;
  } catch (error) {
    console.error('Error in attendToTicket:', error);
    throw error;
  }
};
/**
 * use this function to update details outside the chat array
 * Details like priority can he updated here
 */
const updateById = async (id, reqBody, files, userId) => {
  const updates = Object.keys(reqBody);
  const isTicket = await ticketById(id);

  if (!isTicket) {
    throw new Error(`Unable to get ticket with the provided id: ${id}`);
  }

  updates.forEach(update => {
    isTicket[update] = reqBody[update];
  });
  let comment;
  let note;
  if (reqBody.comment) {
    const authenticatedUser = await Users.findOne({ _id: ObjectId(userId) });
    comment = {
      text: reqBody.comment,
      user: {
        email: authenticatedUser.email,
        first_name: authenticatedUser.first_name,
        last_name: authenticatedUser.last_name,
        image_url: authenticatedUser.image_url
      },
      createdAt: new Date()
    };
    isTicket.ticketComments.unshift(comment);
  }
  if (reqBody.note) {
    const authenticatedUser = await Users.findOne({ _id: ObjectId(userId) });
    note = {
      text: reqBody.note,
      _id: authenticatedUser._id,
      name: `${authenticatedUser.first_name} ${authenticatedUser.last_name}`,
      createdAt: new Date()
    };
    isTicket.notes.unshift(note);
  }
  await isTicket.save();
  return isTicket;
};
/**
 * Use this function to edit individual messages
 */
const updateTicketMessageByTicketIdAndMessageId = async (ticketId, messageId, newContent, files, userId) => {
  // Find the ticket
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Find the specific message in the ticket's chats
  const messageIndex = ticket.chats.findIndex(
    chat => chat._id.toString() === messageId && chat.sender.toString() === userId
  );

  if (messageIndex === -1) {
    throw new Error('Message not found or you do not have permission to edit this message');
  }

  // Update the message content
  ticket.chats[messageIndex].content = newContent;

  // Handle file attachments
  if (files && files.attachments) {
    const uploadedFiles = await uploadFilesToS3(files.attachments, ticket._id);
    const newAttachments = [...uploadedFiles];

    // Append new attachments to existing ones
    ticket.chats[messageIndex].attachments = [...ticket.chats[messageIndex].attachments, ...newAttachments];
  }

  // Update last message and time if this is the most recent message
  if (messageIndex === ticket.chats.length - 1) {
    ticket.lastMessage = newContent;
    ticket.lastMessageTime = new Date();
  }

  // Add an edit timestamp to the message
  ticket.chats[messageIndex].editedAt = new Date();

  // Save the updated ticket
  await ticket.save();

  return ticket;
};
/**
 * Use this function to delete ticket
 * Note that this function only marks is_deleted to true
 */
const deleteById = async ticketId => {
  const isTicket = await ticketById(ticketId);
  if (!isTicket) {
    throw new Error(`Could not find ticket with the provided id ${ticketId}`);
  }
  isTicket.is_deleted = true;
  await isTicket.save();

  return isTicket;
};
// function to get all tickets attached to users by their id
const ticketByUserId = async (userId, reqQuery) => {
  try {
    const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 30;
    const sort = reqQuery.sort ? parseInt(reqQuery.sort, 10) : -1;
    const sortBy = reqQuery.sortBy || 'createdAt';
    const skip = (page - 1) * limit;
    // Fetch the tickets where the user is a participant
    const tickets = await Ticket.find({ participants: userId })
      .populate({
        path: 'company_id',
        select: 'company_name logo'
      })
      .populate({
        path: 'chats.sender',
        select: 'first_name last_name email image_url'
      })
      .sort({ [sortBy]: sort })
      .skip(skip)
      .limit(limit)
      .exec();

    // Filter the chats array to only include the last message
    const filteredTickets = tickets.map(ticket => {
      const lastMessage = ticket.chats.sort((a, b) => b.createdAt - a.createdAt)[0]; // Get the last message

      // Return the ticket with only the last message in the chats array
      return {
        ...ticket.toObject(),
        chats: lastMessage ? [lastMessage] : []
      };
    });

    return filteredTickets;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Use this function to filter tickers by provided query params
 */
const getAllTicketsOne = async reqQuery => {
  const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
  const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 30;
  const sort = reqQuery.sort ? parseInt(reqQuery.sort, 10) : -1;
  const sortBy = reqQuery.sortBy || 'createdAt';
  const skip = (page - 1) * limit;

  const pipeline = [
    // Lookup to get participant details
    {
      $lookup: {
        from: 'users',
        localField: 'participants',
        foreignField: '_id',
        as: 'participantDetails'
      }
    },
    // Unwind participantDetails to search within them
    { $unwind: '$participantDetails' },
    // Match stage
    {
      $match: {
        is_deleted: false,
        $or: [
          { status: reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { priority: reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'chats.content': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'participantDetails.first_name': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'participantDetails.last_name': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { incident_number: reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ }
        ]
      }
    },
    // Group back to restore document structure
    {
      $group: {
        _id: '$_id',
        participants: { $first: '$participants' },
        participantDetails: { $push: '$participantDetails' },
        lastMessage: { $first: '$lastMessage' },
        status: { $first: '$status' },
        priority: { $first: '$priority' },
        anonymous: { $first: '$anonymous' },
        ticketComments: { $first: '$ticketComments' },
        is_deleted: { $first: '$is_deleted' },
        type: { $first: '$type' },
        created_by: { $first: '$created_by' },
        incident_number: { $first: '$incident_number' },
        chats: { $first: '$chats' },
        lastMessageTime: { $first: '$lastMessageTime' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        company_id: { $first: '$company_id' }
      }
    },
    // Unwind chats to populate sender
    { $unwind: '$chats' },
    // Lookup to get sender details
    {
      $lookup: {
        from: 'users',
        localField: 'chats.sender',
        foreignField: '_id',
        as: 'senderDetails'
      }
    },
    { $unwind: '$senderDetails' },
    // Add sender details to chats
    {
      $addFields: {
        'chats.sender': {
          _id: '$senderDetails._id',
          first_name: '$senderDetails.first_name',
          last_name: '$senderDetails.last_name',
          email: '$senderDetails.email',
          image_url: '$senderDetails.image_url'
        }
      }
    },
    // Group back to restore document structure
    {
      $group: {
        _id: '$_id',
        participants: { $first: '$participants' },
        participantDetails: { $first: '$participantDetails' },
        lastMessage: { $first: '$lastMessage' },
        status: { $first: '$status' },
        priority: { $first: '$priority' },
        anonymous: { $first: '$anonymous' },
        ticketComments: { $first: '$ticketComments' },
        is_deleted: { $first: '$is_deleted' },
        type: { $first: '$type' },
        created_by: { $first: '$created_by' },
        incident_number: { $first: '$incident_number' },
        chats: { $push: '$chats' },
        lastMessageTime: { $first: '$lastMessageTime' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        company_id: { $first: '$company_id' }
      }
    },
    // Project to format the output
    {
      $project: {
        _id: 1,
        participants: 1,
        lastMessage: 1,
        status: 1,
        priority: 1,
        anonymous: 1,
        ticketComments: 1,
        is_deleted: 1,
        type: 1,
        created_by: 1,
        incident_number: 1,
        chats: 1,
        lastMessageTime: 1,
        createdAt: 1,
        updatedAt: 1,
        company_id: 1,
        raisedBy: {
          $let: {
            vars: {
              firstParticipant: { $arrayElemAt: ['$participantDetails', 0] }
            },
            in: {
              first_name: '$$firstParticipant.first_name',
              last_name: '$$firstParticipant.last_name',
              image_url: '$$firstParticipant.image_url',
              email: '$$firstParticipant.email',
              _id: '$$firstParticipant._id'
            }
          }
        }
      }
    },
    // Sort, skip, and limit
    { $sort: { [sortBy]: sort } },
    { $skip: skip },
    { $limit: limit }
  ];

  if (reqQuery.companyId) {
    pipeline[2].$match.company_id = ObjectId(reqQuery.companyId);
  }

  if (reqQuery.userId) {
    pipeline[2].$match.participants = ObjectId(reqQuery.userId);
  }

  const response = await Ticket.aggregate(pipeline);
  return response;
};

const getAllTicketsTwo = async reqQuery => {
  const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
  const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 30;
  const sort = reqQuery.sort ? parseInt(reqQuery.sort, 10) : -1;
  const sortBy = reqQuery.sortBy || 'createdAt';
  const skip = (page - 1) * limit;

  const pipeline = [
    // Lookup to get participant details from Users
    {
      $lookup: {
        from: 'users',
        localField: 'participants',
        foreignField: '_id',
        as: 'userParticipantDetails'
      }
    },
    // Lookup to get participant details from Pocs if not found in Users
    {
      $lookup: {
        from: 'pocs',
        localField: 'participants',
        foreignField: '_id',
        as: 'pocParticipantDetails'
      }
    },
    // Combine user and poc participant details
    {
      $addFields: {
        participantDetails: {
          $map: {
            input: '$participants',
            as: 'participant',
            in: {
              $cond: {
                if: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$userParticipantDetails',
                          as: 'user',
                          cond: { $eq: ['$$user._id', '$$participant'] }
                        }
                      }
                    },
                    0
                  ]
                },
                then: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$userParticipantDetails',
                        as: 'user',
                        cond: { $eq: ['$$user._id', '$$participant'] }
                      }
                    },
                    0
                  ]
                },
                else: {
                  $cond: {
                    if: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$pocParticipantDetails',
                              as: 'poc',
                              cond: { $eq: ['$$poc._id', '$$participant'] }
                            }
                          }
                        },
                        0
                      ]
                    },
                    then: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$pocParticipantDetails',
                            as: 'poc',
                            cond: { $eq: ['$$poc._id', '$$participant'] }
                          }
                        },
                        0
                      ]
                    },
                    else: null
                  }
                }
              }
            }
          }
        }
      }
    },
    // Unwind participantDetails to search within them
    { $unwind: '$participantDetails' },
    // Match stage
    {
      $match: {
        is_deleted: false,
        $or: [
          { status: reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { priority: reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'chats.content': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'participantDetails.first_name': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'participantDetails.last_name': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { incident_number: reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ }
        ]
      }
    },
    // Group back to restore document structure
    {
      $group: {
        _id: '$_id',
        participants: { $first: '$participants' },
        participantDetails: { $push: '$participantDetails' },
        lastMessage: { $first: '$lastMessage' },
        status: { $first: '$status' },
        priority: { $first: '$priority' },
        anonymous: { $first: '$anonymous' },
        ticketComments: { $first: '$ticketComments' },
        is_deleted: { $first: '$is_deleted' },
        type: { $first: '$type' },
        created_by: { $first: '$created_by' },
        incident_number: { $first: '$incident_number' },
        chats: { $first: '$chats' },
        lastMessageTime: { $first: '$lastMessageTime' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        company_id: { $first: '$company_id' }
      }
    },
    // Unwind chats to populate sender
    { $unwind: '$chats' },
    // Lookup to get sender details from Users
    {
      $lookup: {
        from: 'users',
        localField: 'chats.sender',
        foreignField: '_id',
        as: 'senderDetails'
      }
    },
    // Lookup to get sender details from Poc if not found in Users
    {
      $lookup: {
        from: 'pocs',
        localField: 'chats.sender',
        foreignField: '_id',
        as: 'pocSenderDetails'
      }
    },
    // Add sender details to chats
    {
      $addFields: {
        'chats.sender': {
          $cond: {
            if: { $gt: [{ $size: '$senderDetails' }, 0] },
            then: {
              _id: { $arrayElemAt: ['$senderDetails._id', 0] },
              first_name: { $arrayElemAt: ['$senderDetails.first_name', 0] },
              last_name: { $arrayElemAt: ['$senderDetails.last_name', 0] },
              email: { $arrayElemAt: ['$senderDetails.email', 0] },
              image_url: { $arrayElemAt: ['$senderDetails.image_url', 0] }
            },
            else: {
              $cond: {
                if: { $gt: [{ $size: '$pocSenderDetails' }, 0] },
                then: {
                  _id: { $arrayElemAt: ['$pocSenderDetails._id', 0] },
                  first_name: { $arrayElemAt: ['$pocSenderDetails.name', 0] },
                  last_name: '',
                  email: { $arrayElemAt: ['$pocSenderDetails.email', 0] },
                  image_url: { $arrayElemAt: ['$pocSenderDetails.image_url', 0] }
                },
                else: null
              }
            }
          }
        }
      }
    },
    // Group back to restore document structure
    {
      $group: {
        _id: '$_id',
        participants: { $first: '$participants' },
        participantDetails: { $first: '$participantDetails' },
        lastMessage: { $first: '$lastMessage' },
        status: { $first: '$status' },
        priority: { $first: '$priority' },
        anonymous: { $first: '$anonymous' },
        ticketComments: { $first: '$ticketComments' },
        is_deleted: { $first: '$is_deleted' },
        type: { $first: '$type' },
        created_by: { $first: '$created_by' },
        incident_number: { $first: '$incident_number' },
        chats: { $push: '$chats' },
        lastMessageTime: { $first: '$lastMessageTime' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        company_id: { $first: '$company_id' }
      }
    },
    // Project to format the output
    {
      $project: {
        _id: 1,
        participants: 1,
        lastMessage: 1,
        status: 1,
        priority: 1,
        anonymous: 1,
        ticketComments: 1,
        is_deleted: 1,
        type: 1,
        created_by: 1,
        incident_number: 1,
        chats: 1,
        lastMessageTime: 1,
        createdAt: 1,
        updatedAt: 1,
        company_id: 1,
        raisedBy: {
          $let: {
            vars: {
              firstParticipant: { $arrayElemAt: ['$participantDetails', 0] }
            },
            in: {
              first_name: '$$firstParticipant.first_name',
              last_name: '$$firstParticipant.last_name',
              image_url: '$$firstParticipant.image_url',
              email: '$$firstParticipant.email',
              _id: '$$firstParticipant._id'
            }
          }
        }
      }
    },
    // Sort, skip, and limit
    { $sort: { [sortBy]: sort } },
    { $skip: skip },
    { $limit: limit }
  ];

  if (reqQuery.companyId) {
    pipeline[2].$match.company_id = ObjectId(reqQuery.companyId);
  }

  if (reqQuery.userId) {
    pipeline[2].$match.participants = ObjectId(reqQuery.userId);
  }

  const response = await Ticket.aggregate(pipeline);
  return response;
};

const getAllTickets = async reqQuery => {
  const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
  const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 1000;
  const sort = reqQuery.sort ? parseInt(reqQuery.sort, 10) : -1;
  const sortBy = reqQuery.sortBy || 'createdAt';
  const skip = (page - 1) * limit;

  const pipeline = [
    // Lookup to get participant details from Users
    {
      $lookup: {
        from: 'users',
        localField: 'participants',
        foreignField: '_id',
        as: 'userParticipantDetails'
      }
    },
    // Lookup to get participant details from Pocs if not found in Users
    {
      $lookup: {
        from: 'pocs',
        localField: 'participants',
        foreignField: '_id',
        as: 'pocParticipantDetails'
      }
    },
    // Combine user and poc participant details
    {
      $addFields: {
        participantDetails: {
          $map: {
            input: '$participants',
            as: 'participant',
            in: {
              $cond: {
                if: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$userParticipantDetails',
                          as: 'user',
                          cond: { $eq: ['$$user._id', '$$participant'] }
                        }
                      }
                    },
                    0
                  ]
                },
                then: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$userParticipantDetails',
                        as: 'user',
                        cond: { $eq: ['$$user._id', '$$participant'] }
                      }
                    },
                    0
                  ]
                },
                else: {
                  $cond: {
                    if: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$pocParticipantDetails',
                              as: 'poc',
                              cond: { $eq: ['$$poc._id', '$$participant'] }
                            }
                          }
                        },
                        0
                      ]
                    },
                    then: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$pocParticipantDetails',
                            as: 'poc',
                            cond: { $eq: ['$$poc._id', '$$participant'] }
                          }
                        },
                        0
                      ]
                    },
                    else: null
                  }
                }
              }
            }
          }
        }
      }
    },
    // Unwind participantDetails to search within them
    { $unwind: '$participantDetails' },
    // Match stage
    {
      $match: {
        is_deleted: false,
        $or: [
          { status: reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { priority: reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'chats.content': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'participantDetails.first_name': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'participantDetails.last_name': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ },
          { 'participantDetails.name': reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ }, // Added for POC model
          { incident_number: reqQuery.search ? new RegExp(reqQuery.search, 'i') : /.*/ }
        ]
      }
    },
    // Group back to restore document structure
    {
      $group: {
        _id: '$_id',
        participants: { $first: '$participants' },
        participantDetails: { $push: '$participantDetails' },
        lastMessage: { $first: '$lastMessage' },
        status: { $first: '$status' },
        priority: { $first: '$priority' },
        anonymous: { $first: '$anonymous' },
        ticketComments: { $first: '$ticketComments' },
        is_deleted: { $first: '$is_deleted' },
        type: { $first: '$type' },
        created_by: { $first: '$created_by' },
        incident_number: { $first: '$incident_number' },
        chats: { $first: '$chats' },
        lastMessageTime: { $first: '$lastMessageTime' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        company_id: { $first: '$company_id' },
        assignedToId: { $first: '$assignedToId' }
      }
    },
    // Unwind chats to populate sender
    { $unwind: '$chats' },
    // Lookup to get sender details from Users
    {
      $lookup: {
        from: 'users',
        localField: 'chats.sender',
        foreignField: '_id',
        as: 'senderDetails'
      }
    },
    // Lookup to get sender details from Poc if not found in Users
    {
      $lookup: {
        from: 'pocs',
        localField: 'chats.sender',
        foreignField: '_id',
        as: 'pocSenderDetails'
      }
    },
    // Add sender details to chats
    {
      $addFields: {
        'chats.sender': {
          $cond: {
            if: { $gt: [{ $size: '$senderDetails' }, 0] },
            then: {
              _id: { $arrayElemAt: ['$senderDetails._id', 0] },
              first_name: { $arrayElemAt: ['$senderDetails.first_name', 0] },
              last_name: { $arrayElemAt: ['$senderDetails.last_name', 0] },
              email: { $arrayElemAt: ['$senderDetails.email', 0] },
              image_url: { $arrayElemAt: ['$senderDetails.image_url', 0] }
            },
            else: {
              $cond: {
                if: { $gt: [{ $size: '$pocSenderDetails' }, 0] },
                then: {
                  _id: { $arrayElemAt: ['$pocSenderDetails._id', 0] },
                  first_name: { $arrayElemAt: ['$pocSenderDetails.name', 0] },
                  last_name: '',
                  email: { $arrayElemAt: ['$pocSenderDetails.email', 0] },
                  image_url: { $arrayElemAt: ['$pocSenderDetails.image_url', 0] }
                },
                else: null
              }
            }
          }
        }
      }
    },
    // Group back to restore document structure
    {
      $group: {
        _id: '$_id',
        participants: { $first: '$participants' },
        participantDetails: { $first: '$participantDetails' },
        lastMessage: { $first: '$lastMessage' },
        status: { $first: '$status' },
        priority: { $first: '$priority' },
        anonymous: { $first: '$anonymous' },
        ticketComments: { $first: '$ticketComments' },
        is_deleted: { $first: '$is_deleted' },
        type: { $first: '$type' },
        created_by: { $first: '$created_by' },
        incident_number: { $first: '$incident_number' },
        chats: { $push: '$chats' },
        lastMessageTime: { $first: '$lastMessageTime' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        company_id: { $first: '$company_id' },
        assignedToId: { $first: '$assignedToId' }
      }
    },
    // Project to format the output
    {
      $project: {
        _id: 1,
        participants: 1,
        lastMessage: 1,
        status: 1,
        priority: 1,
        anonymous: 1,
        ticketComments: 1,
        is_deleted: 1,
        type: 1,
        created_by: 1,
        incident_number: 1,
        chats: 1,
        lastMessageTime: 1,
        createdAt: 1,
        updatedAt: 1,
        company_id: 1,
        assignedToId: 1,
        raisedBy: {
          $let: {
            vars: {
              firstParticipant: { $arrayElemAt: ['$participantDetails', 0] }
            },
            in: {
              $cond: {
                if: { $ne: ['$$firstParticipant', null] },
                then: {
                  first_name: {
                    $cond: {
                      if: { $ifNull: ['$$firstParticipant.first_name', false] },
                      then: '$$firstParticipant.first_name',
                      else: '$$firstParticipant.name' // Use 'name' for POC model
                    }
                  },
                  last_name: {
                    $cond: {
                      if: { $ifNull: ['$$firstParticipant.last_name', false] },
                      then: '$$firstParticipant.last_name',
                      else: '' // Default to empty string for POC model
                    }
                  },
                  image_url: '$$firstParticipant.image_url',
                  email: '$$firstParticipant.email',
                  _id: '$$firstParticipant._id'
                },
                else: null
              }
            }
          }
        }
      }
    },
    // Sort, skip, and limit
    { $sort: { [sortBy]: sort } },
    { $skip: skip },
    { $limit: limit }
  ];

  if (reqQuery.companyId) {
    pipeline[2].$match.company_id = ObjectId(reqQuery.companyId);
  }

  if (reqQuery.userId) {
    pipeline[2].$match.participants = ObjectId(reqQuery.userId);
  }

  const response = await Ticket.aggregate(pipeline);

  // Post-process to add support agent information
  const processedResponse = await Promise.all(response.map(async (ticket) => {
    try {
      // First, check if ticket has an assigned support agent (assignedToId)
      if (ticket.assignedToId) {
        const assignedSupportAgent = await Users.findById(ticket.assignedToId);

        if (assignedSupportAgent) {
          // Build support agent full name from assigned user
          const fullName = [
            assignedSupportAgent.first_name,
            assignedSupportAgent.middle_name,
            assignedSupportAgent.last_name
          ]
            .filter(part => part && part.trim() !== '')
            .join(' ');

          ticket.support_agent = fullName || 'Unknown Support Agent';
        } else {
          ticket.support_agent = 'No Support Agent Assigned';
        }
      } else if (ticket.participants && ticket.participants.length > 0) {
        // Fallback: If no assignedToId, check the user's default support agent
        const userWhoRaisedTicket = await Users.findById(ticket.participants[0]);

        if (userWhoRaisedTicket && userWhoRaisedTicket.assigned_support_agent) {
          // Get the support agent details
          const supportAgent = await Users.findById(userWhoRaisedTicket.assigned_support_agent);

          if (supportAgent) {
            // Build support agent full name
            const fullName = [supportAgent.first_name, supportAgent.middle_name, supportAgent.last_name]
              .filter(part => part && part.trim() !== '')
              .join(' ');

            ticket.support_agent = fullName || 'Unknown Support Agent';
          } else {
            ticket.support_agent = 'No Support Agent Assigned';
          }
        } else {
          ticket.support_agent = 'No Support Agent Assigned';
        }
      } else {
        ticket.support_agent = 'No Support Agent Assigned';
      }
    } catch (error) {
      console.log('Error fetching support agent:', error.message);
      ticket.support_agent = 'No Support Agent Assigned';
    }

    return ticket;
  }));

  return processedResponse;
};
const getAssignedTickets = async userId => {
  const assignedTickets = await Ticket.find({ participants: ObjectId(userId) })
    .populate({
      path: 'company_id',
      select: 'company_name logo'
    })
    .populate({
      path: 'chats.sender',
      select: 'first_name last_name email image_url'
    });
  const filteredTickets = assignedTickets.map(ticket => {
    const lastMessage = ticket.chats.sort((a, b) => b.createdAt - a.createdAt)[0]; // Get the last message

    // Return the ticket with only the last message in the chats array
    return {
      ...ticket.toObject(),
      chats: lastMessage ? [lastMessage] : []
    };
  });
  return filteredTickets;
};

const ticketsbyCompanyIdOne = async (companyId, reqQuery, userId) => {
  const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
  const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 30;
  const sort = reqQuery.sort ? parseInt(reqQuery.sort, 10) : -1;
  const sortBy = reqQuery.sortBy || 'createdAt';
  const skip = (page - 1) * limit;

  const isCompany = await companiesService.companyById(companyId);
  if (!isCompany) {
    throw new ApiError(400, `Unable to find company with the provided id ${companyId}`);
  }

  const pipeline = [
    { $match: { company_id: ObjectId(companyId), is_deleted: false } },
    { $unwind: '$chats' },

    // Lookup from Users collection
    {
      $lookup: {
        from: 'users',
        localField: 'chats.sender',
        foreignField: '_id',
        as: 'senderDetails'
      }
    },
    {
      $unwind: {
        path: '$senderDetails',
        preserveNullAndEmptyArrays: true // Allow cases where user is not found
      }
    },

    // Lookup from Pocs collection if user is not found
    {
      $lookup: {
        from: 'pocs',
        localField: 'chats.sender',
        foreignField: '_id',
        as: 'pocDetails'
      }
    },
    {
      $unwind: {
        path: '$pocDetails',
        preserveNullAndEmptyArrays: true
      }
    },

    // Add sender details from either Users or Pocs
    {
      $addFields: {
        'chats.sender': {
          _id: { $ifNull: ['$senderDetails._id', '$pocDetails._id'] },
          first_name: { $ifNull: ['$senderDetails.first_name', '$pocDetails.name'] }, // Use name for POC
          last_name: { $ifNull: ['$senderDetails.last_name', null] }, // No last name in POC
          email: { $ifNull: ['$senderDetails.email', '$pocDetails.email'] },
          image_url: { $ifNull: ['$senderDetails.image_url', '$pocDetails.image_url'] }
        }
      }
    },

    // Group by ticket ID and restructure output
    {
      $group: {
        _id: '$_id',
        lastMessage: { $last: '$chats' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        priority: { $first: '$priority' },
        status: { $first: '$status' },
        type: { $first: '$type' },
        incident_number: { $first: '$incident_number' },
        company_id: { $first: '$company_id' },
        description: { $first: '$description' },
        rating: { $first: '$rating' },
        created_by: { $first: '$created_by' },
        ticketComments: { $first: '$ticketComments' },
        completion_date: { $first: '$completion_date' },
        is_deleted: { $first: '$is_deleted' },
        attachments: { $first: '$attachments' },
        participants: { $first: '$participants' }
      }
    },

    // Add last message
    { $addFields: { chats: ['$lastMessage'] } },

    // Lookup for ticket raiser details from Users collection
    {
      $lookup: {
        from: 'users',
        localField: 'participants',
        foreignField: '_id',
        as: 'raiserDetails'
      }
    },
    {
      $unwind: {
        path: '$raiserDetails',
        preserveNullAndEmptyArrays: true
      }
    },

    // Lookup for ticket raiser details from Pocs collection (if not found in Users)
    {
      $lookup: {
        from: 'pocs',
        localField: 'participants',
        foreignField: '_id',
        as: 'pocRaiserDetails'
      }
    },
    {
      $unwind: {
        path: '$pocRaiserDetails',
        preserveNullAndEmptyArrays: true
      }
    },

    // Ensure raisedBy field is properly populated from either Users or Pocs
    {
      $addFields: {
        raisedBy: {
          _id: { $arrayElemAt: ['$participants', 0] },
          first_name: { $ifNull: ['$raiserDetails.first_name', '$pocRaiserDetails.name'] }, // Use `name` for Poc
          last_name: { $ifNull: ['$raiserDetails.last_name', null] }, // No `last_name` in Poc
          email: { $ifNull: ['$raiserDetails.email', '$pocRaiserDetails.email'] },
          image_url: { $ifNull: ['$raiserDetails.image_url', '$pocRaiserDetails.image_url'] }
        }
      }
    },
    {
      $addFields: {
        unreadCount: {
          $size: {
            $filter: {
              input: '$chats',
              as: 'chat',
              cond: {
                $and: [{ $eq: ['$$chat.isRead', false] }, { $ne: ['$$chat.readBy', userId] }]
              }
            }
          }
        }
      }
    },

    // Project final output
    {
      $project: {
        createdAt: 1,
        updatedAt: 1,
        priority: 1,
        _id: 1,
        status: 1,
        type: 1,
        incident_number: 1,
        company_id: 1,
        description: 1,
        rating: 1,
        created_by: 1,
        ticketComments: 1,
        completion_date: 1,
        is_deleted: 1,
        attachments: 1,
        chats: 1,
        raisedBy: 1,
        unreadCount: 1
      }
    },

    { $sort: { [sortBy]: sort } },
    { $skip: skip },
    { $limit: limit }
  ];

  const tickets = await Ticket.aggregate(pipeline);

  return tickets;
};
const ticketsbyCompanyId = async (companyId, reqQuery, userId) => {
  const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
  const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 30;
  const sort = reqQuery.sort ? parseInt(reqQuery.sort, 10) : -1;
  const sortBy = reqQuery.sortBy || 'createdAt';
  const skip = (page - 1) * limit;

  const isCompany = await companiesService.companyById(companyId);
  if (!isCompany) {
    throw new ApiError(400, `Unable to find company with the provided id ${companyId}`);
  }

  const pipeline = [
    { $match: { company_id: ObjectId(companyId), is_deleted: false } },
    { $unwind: '$chats' },

    // Lookup from Users collection
    {
      $lookup: {
        from: 'users',
        localField: 'chats.sender',
        foreignField: '_id',
        as: 'senderDetails'
      }
    },
    {
      $unwind: {
        path: '$senderDetails',
        preserveNullAndEmptyArrays: true // Allow cases where user is not found
      }
    },

    // Lookup from Pocs collection if user is not found
    {
      $lookup: {
        from: 'pocs',
        localField: 'chats.sender',
        foreignField: '_id',
        as: 'pocDetails'
      }
    },
    {
      $unwind: {
        path: '$pocDetails',
        preserveNullAndEmptyArrays: true
      }
    },

    // Add sender details from either Users or Pocs
    {
      $addFields: {
        'chats.sender': {
          _id: { $ifNull: ['$senderDetails._id', '$pocDetails._id'] },
          first_name: { $ifNull: ['$senderDetails.first_name', '$pocDetails.name'] }, // Use name for POC
          last_name: { $ifNull: ['$senderDetails.last_name', null] }, // No last name in POC
          email: { $ifNull: ['$senderDetails.email', '$pocDetails.email'] },
          image_url: { $ifNull: ['$senderDetails.image_url', '$pocDetails.image_url'] }
        }
      }
    },

    // Group by ticket ID and restructure output
    {
      $group: {
        _id: '$_id',
        lastMessage: { $last: '$chats' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        priority: { $first: '$priority' },
        status: { $first: '$status' },
        type: { $first: '$type' },
        incident_number: { $first: '$incident_number' },
        company_id: { $first: '$company_id' },
        description: { $first: '$description' },
        rating: { $first: '$rating' },
        created_by: { $first: '$created_by' },
        ticketComments: { $first: '$ticketComments' },
        completion_date: { $first: '$completion_date' },
        is_deleted: { $first: '$is_deleted' },
        attachments: { $first: '$attachments' },
        participants: { $first: '$participants' }
      }
    },

    // Add last message
    { $addFields: { chats: ['$lastMessage'] } },

    // Lookup for ticket raiser details from Users collection
    {
      $lookup: {
        from: 'users',
        localField: 'participants',
        foreignField: '_id',
        as: 'raiserDetails'
      }
    },
    {
      $unwind: {
        path: '$raiserDetails',
        preserveNullAndEmptyArrays: true
      }
    },

    // Lookup for ticket raiser details from Pocs collection (if not found in Users)
    {
      $lookup: {
        from: 'pocs',
        localField: 'participants',
        foreignField: '_id',
        as: 'pocRaiserDetails'
      }
    },
    {
      $unwind: {
        path: '$pocRaiserDetails',
        preserveNullAndEmptyArrays: true
      }
    },

    // Ensure raisedBy field is properly populated from either Users or Pocs
    {
      $addFields: {
        raisedBy: {
          _id: { $arrayElemAt: ['$participants', 0] },
          first_name: { $ifNull: ['$raiserDetails.first_name', '$pocRaiserDetails.name'] }, // Use `name` for Poc
          last_name: { $ifNull: ['$raiserDetails.last_name', null] }, // No `last_name` in Poc
          email: { $ifNull: ['$raiserDetails.email', '$pocRaiserDetails.email'] },
          image_url: { $ifNull: ['$raiserDetails.image_url', '$pocRaiserDetails.image_url'] }
        }
      }
    },

    {
      $addFields: {
        unreadCount: {
          $size: {
            $filter: {
              input: '$chats',
              as: 'chat',
              cond: {
                $and: [{ $eq: ['$$chat.isRead', false] }, { $ne: ['$$chat.readBy', userId] }]
              }
            }
          }
        }
      }
    },

    // Project final output
    {
      $project: {
        createdAt: 1,
        updatedAt: 1,
        priority: 1,
        _id: 1,
        status: 1,
        type: 1,
        incident_number: 1,
        company_id: 1,
        description: 1,
        rating: 1,
        created_by: 1,
        ticketComments: 1,
        completion_date: 1,
        is_deleted: 1,
        attachments: 1,
        chats: 1,
        raisedBy: 1,
        unreadCount: 1
      }
    },

    { $sort: { [sortBy]: sort } },

    // Ensure unique items based on _id field
    {
      $group: {
        _id: '$_id',
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        priority: { $first: '$priority' },
        status: { $first: '$status' },
        type: { $first: '$type' },
        incident_number: { $first: '$incident_number' },
        company_id: { $first: '$company_id' },
        description: { $first: '$description' },
        rating: { $first: '$rating' },
        created_by: { $first: '$created_by' },
        ticketComments: { $first: '$ticketComments' },
        completion_date: { $first: '$completion_date' },
        is_deleted: { $first: '$is_deleted' },
        attachments: { $first: '$attachments' },
        chats: { $first: '$chats' },
        raisedBy: { $first: '$raisedBy' },
        unreadCount: { $first: '$unreadCount' }
      }
    },

    { $skip: skip },
    { $limit: limit }
  ];

  const tickets = await Ticket.aggregate(pipeline);

  return tickets;
};

// function to makr ticket as complete
const marckTicketAsComplete = async (ticketId, userId, role) => {
  const isTicket = await Ticket.findById(ticketId);
  if (!isTicket) throw new Error(`Could not find ticket by the provided id ${ticketId}`);

  const isParticipantOriSAdmin = isTicket.participants.includes(userId) || role === 'Super Admin' || role === 'Admin';

  if (!isParticipantOriSAdmin) {
    throw new Error('You do not have permission to mark this ticket as complete');
  }
  const authenticatedUserDoc = await Users.findById(userId);
  if (!authenticatedUserDoc) {
    return { message: `Could not complete ticket.` };
  }
  // Mark the ticket as completed
  isTicket.status = 'Completed';
  isTicket.completed_by = {
    _id: userId,
    first_name: authenticatedUserDoc.first_name,
    last_name: authenticatedUserDoc.last_name,
    email: authenticatedUserDoc.email
  };
  isTicket.completion_date = new Date();
  // console.log(isTicket._id, 'this is the ticket id now');
  await isTicket.save();
  // notify user
  const notificationBody = {
    notification_text: `Ticket ${isTicket.incident_number} has been marked as complete`,
    notification_type: 'Support',
    user_id: [isTicket.participants[0].toString()],
    flashNotifications: [
      {
        title: 'Ticket Closed',
        text: `Ticket ${isTicket.incident_number} has been marked as complete`,
        module: 'Tickets'
      }
    ]
  };
  await notificationService.createNewNotification(notificationBody, userId);

  return isTicket;
};

const removeAttachmentsFromTicketMessage = async (ticketId, messageId, reqBody, userId, role) => {
  const isTicket = await Ticket.findbyId(ticketId)
    .populate({
      path: 'company_id',
      select: 'company_name logo'
    })
    .populate({
      path: 'chats.sender',
      select: 'first_name last_name email image_url'
    });
  if (!isTicket) throw new Error(`Could not find ticket by the provided id ${ticketId}`);

  // get the message to modify
  const messageToUpdate = isTicket.chats.filter(chat => chat._id.toString() === messageId);
  if (!messageToUpdate) throw new Error(`Invalid message id`);

  // Check if the user is the sender of the message
  if (messageToUpdate.sender.toString() !== userId.toString()) {
    throw new Error(`You are not authorized to modify this message`);
  }

  // Get the attachments to remove
  const attachmentsToRemove = reqBody.attachments;
  if (!Array.isArray(attachmentsToRemove) || attachmentsToRemove.length === 0) {
    throw new Error(`No attachments provided or invalid format`);
  }

  // Iterate through each attachment to remove
  attachmentsToRemove.forEach(attachment => {
    // Find the index of the attachment to remove
    const attachmentIndex = messageToUpdate.attachments.indexOf(attachment);
    if (attachmentIndex !== -1) {
      // Remove the attachment from the array
      messageToUpdate.attachments.splice(attachmentIndex, 1);
    }
  });

  // Save the updated ticket
  await isTicket.save();
  return Ticket;
};

const reassignTicket = async (ticketId, userId, assignToId, roleName) => {
  const userToReassignTicket = await Users.findById(assignToId);
  if (!userToReassignTicket) {
    throw new Error('Invalid user id for assign to id');
  }

  const systemRole = roleName;
  if (systemRole !== 'Admin' && systemRole !== 'Super Admin') {
    throw new Error('You do not have permission to complete this action');
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }

  const isUser = await Users.findById(assignToId);
  if (!isUser) {
    throw new Error('Invalid user id for assigned to id');
  }

  await ticket.updateAssignedToId(assignToId, true);
  // create notification
  const notificationBody = {
    // notification_text: `We are thrilled to inform you that the issue raised on Ticket ${ticket.incident_number} is now being addressed by ${userToReassignTicket.first_name} ${userToReassignTicket.last_name}`,
    notification_text: `Ticket ${ticket.incident_number} has been reassigned.`,
    notification_type: 'Support',
    user_id: [ticket.participants[0].toString()],
    flashNotifications: [
      {
        title: 'Ticket Reassigned',
        // text: `The issue raised on Ticket ${ticket.incident_number} is now being addressed by ${userToReassignTicket.first_name} ${userToReassignTicket.last_name}`,
        text: `Ticket ${ticket.incident_number} is now being addressed by ${userToReassignTicket.first_name} ${userToReassignTicket.last_name}`,
        module: 'Tickets'
      }
    ]
  };
  await notificationService.createNewNotification(notificationBody, userId);
  // web push notification
  await webPush.sendNotification(
    assignToId,
    'Ticket Reassigned',
    `Ticket:${ticket.incident_number} has been reassigned to you. Please follow up on the issue raised`,
    productId
  );

  await ticket.save();
  const ticketDoc = await ticketById(ticket._id);
  if (!ticketDoc) throw new Error(`Could not find ticket with id ${ticket._id}`);

  // Get ticket raiser and company information
  const raiserName = ticketDoc.chats && ticketDoc.chats.length > 0
    ? `${ticketDoc.chats[0].sender.first_name} ${ticketDoc.chats[0].sender.last_name}`
    : 'Unknown User';
  const companyName = (ticketDoc.company_id && ticketDoc.company_id.company_name) || '';

  // Send email to inform the newly reassigned person
  if (userToReassignTicket && userToReassignTicket.email) {
    try {
      // Try to use email template if it exists
      const templateForEmail = await emailTemplate.findOne({ name: 'Ticket Assigned' });

      if (templateForEmail) {
        const replacedTemplate = await emailTemplateService.getEmailTemplateOnIDWithoutContent(
          templateForEmail._id,
          assignToId,
          {
            incidentNumber: ticket.incident_number,
            ticketRaiser: raiserName,
            companyName: companyName
          }
        );

        if (replacedTemplate && replacedTemplate.to && replacedTemplate.subject && replacedTemplate.content) {
          await sendRawEmail(
            replacedTemplate.to,
            replacedTemplate.subject,
            replacedTemplate.content,
            replacedTemplate.cc || [],
            []
          );
        } else {
          throw new Error('Template replacement returned invalid data');
        }
      } else {
        // If template doesn't exist, create a custom HTML email (similar to raiseTicket)
        const reassignedUserEmailBody = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket Reassignment</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                font-size: 16px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
                margin-bottom: 20px;
              }
              .content {
                padding: 20px 0;
              }
              .ticket-details {
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 4px;
                margin: 15px 0;
              }
              .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #eee;
                margin-top: 20px;
                font-size: 14px;
                color: #777;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Ticket Reassignment</h2>
              </div>
              <div class="content">
                <p>Dear ${userToReassignTicket.first_name || userToReassignTicket.name || ''} ${userToReassignTicket.last_name || ''},</p>
                <p>You have been assigned to a ticket that was previously assigned to another support agent. Here are the details:</p>

                <div class="ticket-details">
                  <p><strong>Ticket Number:</strong> ${ticket.incident_number}</p>
                  <p><strong>Ticket Type:</strong> ${ticket.type}</p>
                  <p><strong>Priority:</strong> ${ticket.priority}</p>
                  <p><strong>Status:</strong> ${ticket.status}</p>
                  <p><strong>Raised By:</strong> ${raiserName}</p>
                  ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ''}
                  <p><strong>Last Message:</strong> ${ticket.lastMessage || 'No message'}</p>
                </div>

                <p>Please review this ticket at your earliest convenience and follow up on the issue raised.</p>
                <p>Thank you for your attention to this matter.</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendRawEmail(
          [userToReassignTicket.email],
          `Ticket Reassignment: ${ticket.incident_number}`,
          reassignedUserEmailBody,
          [],
          []
        );
      }
    } catch (error) {
      console.error('Error sending reassignment email:', error);
      // Don't throw error - email failure shouldn't break the reassignment
      // Log the error but continue with the reassignment
    }
  }

  return ticketDoc;
};

const ticketStats = async reqBody => {
  try {
    // Define all possible enums and keys to ensure they are included in the results
    const priorities = ['Low', 'Medium', 'High'];
    const statuses = ['New', 'Ongoing', 'Completed'];
    const types = [
      'Application Status',
      'Invoice',
      'Letter Request',
      'Clients',
      'Referrals',
      'Renewal',
      'Medical Insurance',
      'Modification',
      'Sponsorship',
      'Agreement',
      'Miscellaneous',
      'Cancellation',
      'Partners',
      'Other'
    ];
    const anonymousOptions = ['Yes', 'No'];

    const pipeline = [
      {
        $match: { is_deleted: false }
      },
      {
        $facet: {
          priorityStats: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                priority: '$_id',
                count: 1,
                _id: 0
              }
            },
            {
              $sort: { priority: 1 }
            }
          ],
          statusStats: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                status: '$_id',
                count: 1,
                _id: 0
              }
            },
            {
              $sort: { status: 1 }
            }
          ],
          typeStats: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                type: '$_id',
                count: 1,
                _id: 0
              }
            },
            {
              $sort: { type: 1 }
            }
          ],
          anonymousStats: [
            {
              $group: {
                _id: '$anonymous',
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                anonymous: '$_id',
                count: 1,
                _id: 0
              }
            },
            {
              $sort: { anonymous: 1 }
            }
          ],
          assignmentStats: [
            {
              $group: {
                _id: {
                  $cond: {
                    if: { $gt: [{ $size: '$participants' }, 1] },
                    then: 'Assigned',
                    else: 'Unassigned'
                  }
                },
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                assignment: '$_id',
                count: 1,
                _id: 0
              }
            }
          ],
          totalChats: [
            {
              $group: {
                _id: null,
                count: { $sum: { $size: '$chats' } }
              }
            }
          ],
          assignedUserStats: [
            {
              $match: {
                $expr: { $gt: [{ $size: '$participants' }, 1] }
              }
            },
            {
              $addFields: {
                assignedTo: { $arrayElemAt: ['$participants', -1] }
              }
            },
            {
              $group: {
                _id: '$assignedTo',
                totalTickets: { $sum: 1 },
                newCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] }
                },
                ongoingCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'Ongoing'] }, 1, 0] }
                },
                completedCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                },
                incidents: { $push: '$incident_number' }
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
              }
            },
            {
              $unwind: '$user'
            },
            {
              $project: {
                user: {
                  _id: '$user._id',
                  first_name: '$user.first_name',
                  last_name: '$user.last_name'
                },
                totalTickets: 1,
                statusCounts: {
                  new: '$newCount',
                  ongoing: '$ongoingCount',
                  completed: '$completedCount'
                },
                incidents: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          // Ensure all possible priorities are present
          priorityStats: {
            $map: {
              input: priorities,
              as: 'priority',
              in: {
                priority: '$$priority',
                count: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$priorityStats',
                            as: 'stat',
                            cond: { $eq: ['$$stat.priority', '$$priority'] }
                          }
                        },
                        0
                      ]
                    },
                    { count: 0 }
                  ]
                }
              }
            }
          },
          // Ensure all possible statuses are present
          statusStats: {
            $map: {
              input: statuses,
              as: 'status',
              in: {
                status: '$$status',
                count: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$statusStats',
                            as: 'stat',
                            cond: { $eq: ['$$stat.status', '$$status'] }
                          }
                        },
                        0
                      ]
                    },
                    { count: 0 }
                  ]
                }
              }
            }
          },
          // Ensure all possible types are present
          typeStats: {
            $map: {
              input: types,
              as: 'type',
              in: {
                type: '$$type',
                count: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$typeStats',
                            as: 'stat',
                            cond: { $eq: ['$$stat.type', '$$type'] }
                          }
                        },
                        0
                      ]
                    },
                    { count: 0 }
                  ]
                }
              }
            }
          },
          // Ensure both 'Yes' and 'No' anonymous options are present
          anonymousStats: {
            $map: {
              input: anonymousOptions,
              as: 'anonymous',
              in: {
                anonymous: '$$anonymous',
                count: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$anonymousStats',
                            as: 'stat',
                            cond: { $eq: ['$$stat.anonymous', '$$anonymous'] }
                          }
                        },
                        0
                      ]
                    },
                    { count: 0 }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          priorityStats: 1,
          statusStats: 1,
          typeStats: 1,
          anonymousStats: 1,
          assignmentStats: 1,
          totalChats: { $arrayElemAt: ['$totalChats.count', 0] },
          assignedUserStats: 1
        }
      }
    ];

    if (reqBody.selected_company_id) {
      pipeline.unshift(...queryService(reqBody));
    }

    const result = await Ticket.aggregate(pipeline);
    return result[0];
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  updateById,
  ticketById,
  deleteById,
  ticketByUserId,
  getAllTickets,
  getAssignedTickets,
  ticketsbyCompanyId,
  raiseTicket,
  attendToTicket,
  updateTicketMessageByTicketIdAndMessageId,
  marckTicketAsComplete,
  markChatAsRead,
  removeAttachmentsFromTicketMessage,
  reassignTicket,
  ticketStats
};
