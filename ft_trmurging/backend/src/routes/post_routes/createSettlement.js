const express = require('express');
const Auth = require('../../controllers/middleware.js');
const SettlementSchema = require('../../models/Schemas/Settlement.js');
const printLogsDate = require('../../utils/printLogs.js');

const SettlementRouter = express.Router();

SettlementRouter.post(`/`, Auth, async (req, res) => {
    const {groupId, toUserId, amount} = req.body;
    if (!groupId || !toUserId || !amount)
        return res.status(400).send("Settlement data is invalid !");
    if (toUserId === req.session.userId)
        return res.status(400).send("you Cannot settle with yourself.");
    const newSettlement = new SettlementSchema({
        group: req.body.groupId,
        fromUser: req.session.userId,
        toUser: req.body.toUserId,
        status: "pending",
        amount: req.body.amount,
    });
    try {
        await newSettlement.save();
        const userId = req.session.userId;
        printLogsDate(`User with Id ${userId} created a Settlement at : `);
        return res.redirect('Dashboard');
    } catch (error) {
        console.error("Error while saving the settlement");
        return res.status(500).send("Internal Error while attempting to save the settlement.");
    }
});

module.exports = SettlementRouter;