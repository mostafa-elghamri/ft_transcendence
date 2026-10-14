const mongoose = require("mongoose");
const Group = require("../models/Schemas/Group");
const User = require("../models/Schemas/User");
const Conversation = require("../models/Schemas/Conversation");
const Message = require("../models/Schemas/Message");
const GroupInvitation = require("../models/Schemas/GroupInvitation");
const Notification = require("../models/Schemas/Notification");

const createGroup = async (req, res, next) => {
  try {
    const { name } = req.body;
    const createdBy = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Group name is required"
      });
    }

    const group = await Group.create({
      name: name.trim(),
      createdBy: createdBy,
      members: [
        {
          userId: createdBy,
          role: "owner"
        }
      ]
    });

    const conversation = await Conversation.create({
      participants: [createdBy]
    });

    group.conversationId = conversation._id;

    await group.save();

    return res.status(201).json({
      message: "Group created successfully",
      group,
      conversation
    });

  } catch (error) {
    next(error);
  }
};

const addMemberToGroup = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const addedBy = req.user.id;
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const isOwner = group.members.some(
      (member) =>
        member.userId.toString() === addedBy &&
        member.role === "owner"
    );

    if (!isOwner) {
      return res.status(403).json({
        message: "Only the group owner can add members"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const alreadyMember = group.members.some(
      (member) => member.userId.toString() === userId
    );

    if (alreadyMember) {
      return res.status(409).json({
        message: "User is already a member"
      });
    }

    group.members.push({
      userId: userId,
      role: "member"
    });

    await group.save();

    if (group.conversationId) {
      await Conversation.findByIdAndUpdate(
        group.conversationId,
        {
          $addToSet: {
            participants: userId
          }
        }
      );
    }

    return res.status(200).json({
      message: "Member added successfully",
      group
    });
  } catch (error) {
    next(error);
  }
};

const removeMemberFromGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;
    const removedBy = req.user.id;

    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        message: "Invalid ID"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const isOwner = group.members.some(
      (member) =>
        member.userId.toString() === removedBy &&
        member.role === "owner"
    );

    if (!isOwner) {
      return res.status(403).json({
        message: "Only the group owner can remove members"
      });
    }

    const memberIndex = group.members.findIndex(
      (member) => member.userId.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        message: "User is not a member of this group"
      });
    }

    const member = group.members[memberIndex];

    if (member.role === "owner") {
      return res.status(400).json({
        message: "The group owner cannot be removed"
      });
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    if (group.conversationId) {
      await Conversation.findByIdAndUpdate(
        group.conversationId,
        {
          $pull: {
            participants: userId
          }
        }
      );
    }

    return res.status(200).json({
      message: "Member removed successfully",
      group
    });
  } catch (error) {
    next(error);
  }
};

const getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        message: "Invalid group ID"
      });
    }

    const group = await Group.findById(groupId)
      .populate("createdBy", "username email")
      .populate("members.userId", "username email");

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const isMember = group.members.some(
      (member) =>
        member.userId &&
        member.userId._id.toString() === currentUserId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group"
      });
    }

    return res.status(200).json({
      group
    });
  } catch (error) {
    next(error);
  }
};

const getUserGroups = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    const groups = await Group.find({
      "members.userId": currentUserId
    })
      .populate("createdBy", "username email")
      .populate("members.userId", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: groups.length,
      groups
    });
  } catch (error) {
    next(error);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        message: "Invalid group ID"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const memberIndex = group.members.findIndex(
      (member) =>
        member.userId.toString() === currentUserId
    );

    if (memberIndex === -1) {
      return res.status(403).json({
        message: "You are not a member of this group"
      });
    }

    const member = group.members[memberIndex];

    if (member.role === "owner") {
      return res.status(400).json({
        message: "The group owner cannot leave the group"
      });
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    if (group.conversationId) {
      await Conversation.findByIdAndUpdate(
        group.conversationId,
        {
          $pull: {
            participants: currentUserId
          }
        }
      );
    }

    return res.status(200).json({
      message: "You left the group successfully"
    });
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name } = req.body;
    const updatedBy = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        message: "Invalid group ID"
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Group name is required"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const isOwner = group.members.some(
      (member) =>
        member.userId.toString() === updatedBy &&
        member.role === "owner"
    );

    if (!isOwner) {
      return res.status(403).json({
        message: "Only the group owner can update the group"
      });
    }

    group.name = name.trim();

    await group.save();

    return res.status(200).json({
      message: "Group updated successfully",
      group
    });
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const deletedBy = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        message: "Invalid group ID"
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }

    const isOwner = group.members.some(
      (member) =>
        member.userId.toString() === deletedBy &&
        member.role === "owner"
    );

    if (!isOwner) {
      return res.status(403).json({
        message: "Only the group owner can delete the group"
      });
    }

    if (group.conversationId) {
      await Message.deleteMany({
        conversationId: group.conversationId
      });

      await Conversation.findByIdAndDelete(
        group.conversationId
      );
    }

    const invitations = await GroupInvitation.find({
      groupId: group._id
    }).select("_id");

    const invitationIds = invitations.map(
      (invitation) => invitation._id
    );

    if (invitationIds.length > 0) {
      await Notification.deleteMany({
        relatedId: { $in: invitationIds }
      });
    }
    await GroupInvitation.deleteMany({
      groupId: group._id
    });

    await Group.findByIdAndDelete(group._id);

    return res.status(200).json({
      message: "Group deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  getGroupById,
  getUserGroups,
  leaveGroup,
  updateGroup,
  deleteGroup
};