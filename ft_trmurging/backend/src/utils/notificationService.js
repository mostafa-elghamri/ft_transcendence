const Notification = require("../models/Schemas/Notification");

const createNotification = async ({
    userId,
    senderId = null,
    type,
    title,
    message,
    relatedId = null
}) => {
    try {

    const notification = await Notification.create({
        userId,
        senderId,
        type,
        title,
        message,
        relatedId,
        isRead: false
    });

    await notification.populate("senderId", "username");

    return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

module.exports = {
    createNotification
};