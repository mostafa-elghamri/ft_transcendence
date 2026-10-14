const express = require('express');
const ExpenseSchema = require('../../models/Schemas/Expenses.js');
const printLogsDate = require('../../utils/printLogs.js');

const ExpenseRouter = express.Router();

ExpenseRouter.post(`/`, async (req, res) => {
    const {groupId, payer, participants, amount, splitMethod} = req.body;

    if (!groupId || !payer || !amount || !splitMethod)
        return res.status(400).send("Invalid Expense credentials.");
    if (!Array.isArray(participants) || participants.length === 0)
        res.status(400).send("there must be participants in your expense.");
    const newExpense = new ExpenseSchema ({
        group: req.body.groupId,
        payer: req.session.userId,
        participants: participants,
        amount: amount,
        splitMethod: splitMethod,
    });
    try {
        await newExpense.save();
        res.redirect(`Dashboard`);
        const userId = req.session.userId;
        printLogsDate(`User with Id ${userId} created an expense at : `);
    } catch (error) {
        console.error(`Error while attempting to save the Expense.`);
        res.status(500).send("Error while attempting to save the expense");
    }
});

module.exports = ExpenseRouter;