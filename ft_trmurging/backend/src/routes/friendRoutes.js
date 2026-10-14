const express = require("express");
const apiAuth = require("../controllers/apiAuth");

const router = express.Router();

const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getFriendRequests,
  removeFriend
} = require("../controllers/friendController");

router.post("/request", apiAuth, sendFriendRequest);

router.patch("/request/:friendshipId/accept", apiAuth, acceptFriendRequest);

router.patch("/request/:friendshipId/reject", apiAuth, rejectFriendRequest);

router.get("/", apiAuth, getFriends);

router.get("/requests", apiAuth, getFriendRequests);

router.delete("/", apiAuth, removeFriend);

module.exports = router;