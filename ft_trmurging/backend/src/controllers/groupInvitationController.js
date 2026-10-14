const mongoose = require("mongoose");
const GroupInvitation = require("../models/Schemas/GroupInvitation");
const Group = require("../models/Schemas/Group");
const Conversation = require("../models/Schemas/Conversation");
const User = require("../models/Schemas/User");
const Notification = require("../models/Schemas/Notification");
const { createNotification } = require("../utils/notificationService");


const sendGroupInvitation = async (req, res, next) => {
    try {
        const invitedBy = req.user.id;
        const { groupId } = req.params;
        const { userId } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(groupId) ||
            !userId ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            return res.status(400).json({
                message: "Valid groupId and userId are required"
            });
        }

        if (invitedBy === userId.toString()) {
            return res.status(400).json({
                message: "You cannot invite yourself"
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
                member.userId.toString() === invitedBy &&
                member.role === "owner"
        );

        if (!isOwner) {
            return res.status(403).json({
                message: "Only the group owner can invite members"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const alreadyMember = group.members.some(
            (member) =>
                member.userId.toString() === userId.toString()
        );

        if (alreadyMember) {
            return res.status(409).json({
                message: "User is already a member of this group"
            });
        }

        const existingInvitation = await GroupInvitation.findOne({
            groupId,
            invitedUserId: userId,
            status: "pending"
        });

        if (existingInvitation) {
            return res.status(409).json({
                message: "User already has a pending invitation"
            });
        }

        const invitation = await GroupInvitation.create({
            groupId,
            invitedUserId: userId,
            invitedBy,
            status: "pending"
        });

        const notification = await createNotification({
            userId,
            senderId: invitedBy,
            type: "GROUP_INVITATION",
            title: "Group invitation",
            message: `You have been invited to join ${group.name}`,
            relatedId: invitation._id
        });

        const io = req.app.get("io");

        if (io) {
            io.to(`user:${userId}`).emit(
                "newNotification",
                notification
            );
        }

        return res.status(201).json({
            message: "Group invitation sent successfully",
            invitation
        });
    } catch (error) {
        next(error);
    }
};




const acceptGroupInvitation = async (req, res, next) => {
    try {
        const { invitationId } = req.params;
        const currentUserId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            return res.status(400).json({
                message: "Invalid invitation ID"
            });
        }

        const invitation = await GroupInvitation.findById(
            invitationId
        );

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found"
            });
        }

        if (invitation.invitedUserId.toString() !== currentUserId) {
            return res.status(403).json({
                message: "You are not allowed to accept this invitation"
            });
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({
                message: "Invitation is no longer pending"
            });
        }

        const group = await Group.findById(
            invitation.groupId
        );

        if (!group) {
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const alreadyMember = group.members.some(
            (member) =>
                member.userId.toString() === currentUserId
        );

        if (!alreadyMember) {
            group.members.push({
                userId: currentUserId,
                role: "member"
            });

            await group.save();

            if (group.conversationId) {
                await Conversation.findByIdAndUpdate(
                    group.conversationId,
                    {
                        $addToSet: {
                            participants: currentUserId
                        }
                    }
                );
            }
        }

        invitation.status = "accepted";
        await invitation.save();

        return res.status(200).json({
            message: "Invitation accepted successfully",
            group
        });
    } catch (error) {
        next(error);
    }
};

const rejectGroupInvitation = async (req, res, next) => {
    try {
        const { invitationId } = req.params;
        const currentUserId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(invitationId)) {
            return res.status(400).json({
                message: "Invalid invitation ID"
            });
        }

        const invitation = await GroupInvitation.findById(
            invitationId
        );

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found"
            });
        }

        if (invitation.invitedUserId.toString() !== currentUserId){
            return res.status(403).json({
                message: "You are not allowed to reject this invitation"
            });
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({
                message: "Invitation is no longer pending"
            });
        }

        invitation.status = "rejected";
        await invitation.save();

        await Notification.deleteMany({
            relatedId: invitation._id,
            userId: currentUserId,
            type: "GROUP_INVITATION"
        });

        return res.status(200).json({
            message: "Invitation rejected successfully"
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    sendGroupInvitation,
    acceptGroupInvitation,
    rejectGroupInvitation
};