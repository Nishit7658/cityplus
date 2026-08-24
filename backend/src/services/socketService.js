let io = null;

function initSocket(socketIoInstance) {
  io = socketIoInstance;
  
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

function emitEvent(eventName, payload) {
  if (io) {
    io.emit(eventName, payload);
    console.log(`[Socket.IO Broadcast] Event '${eventName}':`, payload.id ? `Complaint #${payload.id}` : 'General update');
  } else {
    console.warn(`[Socket.IO Warning] Attempted to emit '${eventName}' before Socket.IO initialization`);
  }
}

module.exports = {
  initSocket,
  emitEvent,
};
