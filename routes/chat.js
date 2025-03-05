const express = require("express");
const router = express.Router();
const { Chat, User, Group, Message, GroupMember } = require("../models");
const { where, Op } = require("sequelize");

router.get("/user-chats/:uuid", async (req, res) => {
  try {
    const userId = req.params.uuid;
    const user = await User.findOne({ where: { uuid: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const privateChats = await Chat.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        { model: User, attributes: ["uuid", "firstName"] },
        { model: User, attributes: ["uuid", "firstName"] },
        {
          model: Message,
          order: [["createdAt", "DESC"]],
          limit: 1, // Get last message
        },
      ],
    });

    const groupIds = await GroupMember.findAll({
      where: { userId },
      attributes: ["groupId"],
    });

    const groups = await Group.findAll({
      where: { id: groupIds.map((g) => g.groupId) },
      include: [
        {
          model: Message,
          order: [["createdAt", "DESC"]],
          limit: 1, // Get last message
        },
      ],
    });

    return res.status(200).json({ privateChats, groups });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
