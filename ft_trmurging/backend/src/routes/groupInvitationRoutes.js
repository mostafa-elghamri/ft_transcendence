const express = require("express");
const apiAuth = require("../controllers/apiAuth");

const {
  sendGroupInvitation,
  acceptGroupInvitation,
  rejectGroupInvitation
} = require("../controllers/groupInvitationController");

const router = express.Router();

router.post("/:groupId", apiAuth, sendGroupInvitation);

router.patch("/:invitationId/accept", apiAuth, acceptGroupInvitation);

router.patch("/:invitationId/reject", apiAuth, rejectGroupInvitation);

module.exports = router;