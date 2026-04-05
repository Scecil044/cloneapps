// src/services/socketService.js
let io = null;

const initialize = (socketIoInstance) => {
  io = socketIoInstance;
  console.log('Socket service initialized');
};

const getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized yet');
    return {
      emit: () => console.warn('Socket emit called before initialization')
    };
  }
  return io;
};

// Add a function to emit to specific users by their IDs
const emitToUsers = (event, data, userIds = []) => {
  if (!io) {
    console.warn('Socket.io not initialized yet');
    return;
  }

  // Get all connected sockets
  const sockets = io.sockets.sockets;

  // Emit to specific users if their socket is connected
  userIds.forEach(userId => {
    // Find sockets associated with this user
    for (const [socketId, socket] of sockets.entries()) {
      if (socket.userId === userId) {
        socket.emit(event, data);
      }
    }
  });

  // If no userIds provided, broadcast to everyone
  if (userIds.length === 0) {
    io.emit(event, data);
  }
};

module.exports = {
  initialize,
  getIO,
  emitToUsers
};
