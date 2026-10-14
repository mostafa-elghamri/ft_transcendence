const Conversation = require("../models/Schemas/Conversation");
const mongoose = require("mongoose");

const createConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    if (userId === currentUserId) {
      return res.status(400).json({
        message: "You cannot create a conversation with yourself"
      });
    }

    const conversation = await Conversation.create({
      participants: [currentUserId, userId]
    });

    return res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    const conversations = await Conversation.find({
      participants: currentUserId
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};
;

module.exports = {
  createConversation,
  getConversations
};