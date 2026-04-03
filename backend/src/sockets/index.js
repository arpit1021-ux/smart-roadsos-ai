const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join accident room to receive updates for a specific accident
    socket.on('join_accident_room', (accidentId) => {
      socket.join(`accident_${accidentId}`);
      console.log(`Socket ${socket.id} joined accident room: ${accidentId}`);
    });

    // Leave accident room
    socket.on('leave_accident_room', (accidentId) => {
      socket.leave(`accident_${accidentId}`);
      console.log(`Socket ${socket.id} left accident room: ${accidentId}`);
    });

    // Join admin dashboard room (all accidents)
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`Socket ${socket.id} joined admin room`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('WebSocket server initialized');
};

module.exports = setupSocket;
