const { Server } = require('socket.io');
const { Message, Chat, Group, GroupMember } = require('../models');

let onlineUsers = new Map();

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // ✅ Save online users
    socket.on('join', ({userId}) => {
      onlineUsers.set(userId, socket.id);
      console.log(onlineUsers)
      console.log(`User ${userId} is online`);
    });

    // socket.onAny((event, rawData) => {
    // const data = JSON.parse(rawData);
    //    console.log(`🔹 Received event: ${event}, Data:`, data);
    // });

    // ✅ Private Message (DM)
    socket.on('privateMessage', async ({ senderId, receiverId, message }) => {
      let chat = await Chat.findOne({
        where: { senderId, receiverId },
      }) || await Chat.findOne({
        where: { senderId: receiverId, receiverId: senderId },
      });

      if (!chat) {
        chat = await Chat.create({ senderId, receiverId });
      }

      const newMessage = await Message.create({
        chatId: chat.id,
        senderId,
        message,
      });

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', newMessage);
      }

      // Notify sender
      socket.emit('messageSent', newMessage);
    });

    // ✅ Create a Group
    socket.on('createGroup', async ({ hostId, groupName }) => {
      const group = await Group.create({ name: groupName, createdBy:hostId });

      await GroupMember.create({ groupId: group.id, userId: hostId });

      socket.emit('groupCreated', { groupId: group.id, groupName });
    });

    // ✅ Add a Member to Group (Only Host Can Do This)
    socket.on('addMember', async ({ hostId, groupId, userId }) => {
      const group = await Group.findOne({ where: { id: groupId } });
      console.log(`Group created by is ${group.createdBy} and hostId is ${hostId} and userId is ${userId}`)

      if (group && group.createdBy === hostId) {
        console.log('inside if statement')
        await GroupMember.create({ groupId : group.id, userId : userId });

        const userSocketId = onlineUsers.get(userId);
        if (userSocketId) {
          io.to(userSocketId).emit('addedToGroup', { groupId });
        }

        // Notify all group members
        const groupMembers = await GroupMember.findAll({ where: { groupId } });
        groupMembers.forEach(member => {
          const memberSocketId = onlineUsers.get(member.userId);
          if (memberSocketId) {
            io.to(memberSocketId).emit('groupUpdate', { message: `User ${userId} was added to the group.` });
          }
        });
      } else {
        socket.emit('error', 'Only the host can add members');
      }
    });

    // ✅ Remove a Member from Group (Only Host Can Do This)
    socket.on('removeMember', async ({ hostId, groupId, userId }) => {
      const group = await Group.findByPk(groupId);

      if (group && group.hostId === hostId) {
        await GroupMember.destroy({ where: { groupId, userId } });

        const userSocketId = onlineUsers.get(userId);
        if (userSocketId) {
          io.to(userSocketId).emit('removedFromGroup', { groupId });
        }

        // Notify all group members
        const groupMembers = await GroupMember.findAll({ where: { groupId } });
        groupMembers.forEach(member => {
          const memberSocketId = onlineUsers.get(member.userId);
          if (memberSocketId) {
            io.to(memberSocketId).emit('groupUpdate', { message: `User ${userId} was removed from the group.` });
          }
        });
      } else {
        socket.emit('error', 'Only the host can remove members');
      }
    });

    // ✅ Send a Group Message
    socket.on('groupMessage', async ({ senderId, groupId, message }) => {
      const newMessage = await Message.create({
        groupId,
        senderId,
        message,
      });

      const groupMembers = await GroupMember.findAll({
        where: { groupId },
        attributes: ['userId'],
      });

      groupMembers.forEach((member) => {
        const receiverSocketId = onlineUsers.get(member.userId);
        if (receiverSocketId && member.userId !== senderId) {
          io.to(receiverSocketId).emit('receiveMessage', newMessage);
        }
      });
    });

    // ✅ Handle Disconnect
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

module.exports = setupSocket;
