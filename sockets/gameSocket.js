const { Game, GameRequest, User } = require('../models');

let onlineUsers = new Map();

const setupGameSocket = (io) => {
  const gameNamespace = io.of('/game');

  gameNamespace.on('connection', (socket) => {
    console.log('New user connected to game socket:', socket.id);

    // Save online users
    socket.on('join', ({ userId }) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} is online`);
    });

    // Notify host when a user joins a game
    socket.on('joinGame', async ({ gameId, userId }) => {
      const game = await Game.findOne({ where: { uuid: gameId } });
      const host = await User.findOne({ where: { email: game.userEmail } });
      const hostSocketId = onlineUsers.get(host.uuid);

      if (hostSocketId) {
        gameNamespace.to(hostSocketId).emit('userJoinedGame', { gameId, userId });
      }
    });

    // Notify user when the host approves or rejects the request
    socket.on('approveRejectRequest', async ({ requestId, status }) => {
      const request = await GameRequest.findOne({ where: { uuid: requestId } });
      const userSocketId = onlineUsers.get(request.userId);

      if (userSocketId) {
        gameNamespace.to(userSocketId).emit('requestStatusUpdate', { requestId, status });
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      let disconnectedUserId = null;

      onlineUsers.forEach((value, key) => {
        if (value === socket.id) {
          disconnectedUserId = key;
          onlineUsers.delete(key);
        }
      });

      console.log(`User ${disconnectedUserId} disconnected.`);
    });
  });

  return io;
};

module.exports = setupGameSocket;