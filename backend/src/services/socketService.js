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

    // Synchronize aliases across frontend and backend naming conventions
    if (eventName === 'complaint:created' || eventName === 'new_complaint') {
      io.emit('new_complaint', payload);
      io.emit('complaint:created', payload);
    } else if (eventName === 'complaint:updated' || eventName === 'complaint_status_changed') {
      io.emit('complaint_status_changed', payload);
      io.emit('complaint:updated', payload);
    } else if (eventName === 'complaint:reopened' || eventName === 'complaint_reopened') {
      io.emit('complaint_reopened', payload);
      io.emit('complaint:reopened', payload);
    }

    console.log(`[Socket.IO Broadcast] Event '${eventName}':`, payload && payload.id ? `Complaint #${payload.id}` : 'General update');
  } else {
    console.warn(`[Socket.IO Warning] Attempted to emit '${eventName}' before Socket.IO initialization`);
  }
}

module.exports = {
  initSocket,
  emitEvent,
};
