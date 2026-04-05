const { Server } = require('socket.io');
const { createServer } = require('http');
const logger = require('./logger');
const { attendToTicket } = require('../services/tickets.service');
const { Ticket } = require('../models');
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

io.on('connection', client => {
  logger.info(`Client connected: ${client.id}`);

  // Message event listener
  client.on('message', async data => {
    try {
      console.log('this is the data', data);

      const ticket_id = data.ticket_id;
      const user_id = data.message.sender._id;

      io.emit(`message-${user_id}`, data);
      // Update the ticket with new message details
      const updatedTicket = await attendToTicket(
        ticket_id,
        { content: data.message.content, status: data.message.status },
        data.message.attachments,
        user_id
      );
      logger.info(`Message processed and broadcasted for ticket ${ticket_id}`);
    } catch (error) {
      logger.error('Error handling new message:', error);
      client.emit('error', { message: 'Failed to process message' });
    }
  });

  // Room join event
  client.on('join_room', ticketId => {
    if (ticketId) {
      client.join(ticketId);
      logger.info(`Client ${client.id} joined room: ${ticketId}`);
    } else {
      logger.warn('Invalid ticket ID for join_room');
    }
  });

  // Room leave event
  client.on('leave_room', ticketId => {
    if (ticketId) {
      client.leave(ticketId);
      logger.info(`Client ${client.id} left room: ${ticketId}`);
    } else {
      logger.warn('Invalid ticket ID for leave_room');
    }
  });

  // Disconnect event
  client.on('disconnect', () => {
    logger.info(`Client disconnected: ${client.id}`);
  });

  // Typing event
  client.on('typing', data => {
    const { ticket_id, user_id } = data;
    if (ticket_id) {
      console.log('id is there!!!!!!!!!!!!!');
      // Emit to the room that the user is typing
      io.to(ticket_id).emit('typing', data); // Emit to the specific room (ticket_id)
      logger.info(`Client ${client.id} is typing in room: ${ticket_id}`);
    } else {
      logger.warn('Invalid ticket ID for typing event');
    }
  });

  // Listen for stopped_typing event
  client.on('stopped_typing', data => {
    const { ticket_id, user_id } = data;
    if (ticket_id) {
      // Emit to the room that the user has stopped typing
      io.to(ticket_id).emit('stopped_typing', data); // Emit to the specific room (ticket_id)
      logger.info(`Client ${client.id} has stopped typing in room: ${ticket_id}`);
    } else {
      logger.warn('Invalid ticket ID for stopped_typing event');
    }
  });
});

module.exports = {io, httpServer};
