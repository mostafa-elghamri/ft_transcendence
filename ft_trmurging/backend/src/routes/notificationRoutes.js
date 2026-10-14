const express = require("express");
const apiAuth = require("../controllers/apiAuth");

const {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearUserNotifications
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", apiAuth, getNotifications);
router.patch("/:notificationId/read", apiAuth, markNotificationAsRead);
router.delete("/user/all", apiAuth, clearUserNotifications);
router.delete("/:id", apiAuth, deleteNotification);

module.exports = router;