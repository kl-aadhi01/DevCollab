module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific project's chat room
    socket.on('join_project', (projectId) => {
      socket.join(projectId.toString());
      console.log(`Socket ${socket.id} joined project room: ${projectId}`);
    });

    // Leave a specific project's chat room
    socket.on('leave_project', (projectId) => {
      socket.leave(projectId.toString());
      console.log(`Socket ${socket.id} left project room: ${projectId}`);
    });

    // Join a personal notification room
    socket.on('join_user', (userId) => {
      socket.join(userId.toString());
      console.log(`Socket ${socket.id} joined user room: ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
