const Conversation = require("../models/Schemas/Conversation");
const { createNotification } = require("../utils/notificationService");
const Message = require("../models/Schemas/Message");
const mongoose = require("mongoose");

const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { conversationId } = req.params;
    const senderId = req.user.id;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID"
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === senderId
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not a participant in this conversation"
      });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content: content.trim()
    });

    await message.populate("senderId", "_id username");

    const io = req.app.get("io");

    const receiverIds = conversation.participants.filter(
      (id) => id.toString() !== senderId
    );

    for (const receiverId of receiverIds) {
      const notification = await createNotification({
        userId: receiverId,
        senderId,
        type: "CHAT_MESSAGE",
        title: "New message",
        message: content.trim()
      });

      if (io) {
        io.to(`user:${receiverId}`).emit(
          "newNotification",
          notification
        );
      }
    }

    if (io) {
      io.to(`conversation:${conversationId}`).emit(
        "newMessage",
        message
      );
    }

    return res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID"
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    const isParticipant = conversation.participants.some(
      (id) => id.toString() === currentUserId
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not a participant in this conversation"
      });
    }

    const messages = await Message.find({
      conversationId
    })
      .populate("senderId", "_id username")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
};