const express = require("express");
const router = express.Router();
const apiAuth = require("../controllers/apiAuth");

const {
    createGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    getGroupById,
    getUserGroups,
    leaveGroup,
    updateGroup,
    deleteGroup
} = require("../controllers/groupController");

router.post("/", apiAuth, createGroup);

router.post("/:groupId/members", apiAuth, addMemberToGroup);

router.delete("/:groupId/members/:userId", apiAuth, removeMemberFromGroup);

router.get("/me", apiAuth, getUserGroups);

router.get("/:groupId", apiAuth, getGroupById);

router.delete("/:groupId/leave", apiAuth, leaveGroup);

router.patch("/:groupId", apiAuth, updateGroup);

router.delete("/:groupId", apiAuth, deleteGroup);

module.exports = router;