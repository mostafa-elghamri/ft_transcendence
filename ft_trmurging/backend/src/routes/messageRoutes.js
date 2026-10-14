const express = require("express");
const apiAuth = require("../controllers/apiAuth");

const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/:conversationId/messages", apiAuth, sendMessage);
router.get("/:conversationId/messages", apiAuth, getMessages);

module.exports = router;