const express = require('express');
const Auth = require('../../controllers/middleware.js');
const printLogsDate = require('../../utils/printLogs.js');

const CreateGroup = express.Router();

CreateGroup.post(`/`, Auth, async (req, res) => {
    if (!req.body)
        return res.status(400).send("Error while receiving body");
    const newGroup = new GroupSchema ({
        owner: req.session.userId,
        groupName: req.groupName,
        description: req.description,
        members: [req.session.userId],
    });
    try {
        await newGroup.save();
        const userId = req.session.userId;
        printLogsDate(`User with Id ${userId} created a group at : `);
    } catch (error) {
        console.log(error);
    }
});

module.exports = CreateGroup;