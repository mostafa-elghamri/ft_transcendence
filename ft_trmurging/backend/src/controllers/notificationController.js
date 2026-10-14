const Notification = require("../models/Schemas/Notification");

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ userId })
      .populate("senderId", "username")
      .sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: userId
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

const clearUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await Notification.deleteMany({
      userId: userId
    });

    return res.status(200).json({
      message: "All notifications deleted",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearUserNotifications
};