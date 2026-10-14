const ExpenseSchema = require(`../models/Schemas/Expenses`);
const UserSchema = require('../models/Schemas/User');


function returnOthersShares(expense, username) {
    let users = [];
    if (expense.splitMethod === 'equal') {
        for (let participant of expense.participants) {
            if (participant.username !== username) {
                users.push({
                    youOwes: participant.username, 
                    amount: (expense.amount - (expense.amount / expense.participants.length))
                });
            }
        }
        return users;
    }
    else {
        for (let participant of expense.customSplit) {
            console.log("here is the username : ", participant.user.username);
            if (participant.user.username !== username){
                users.push({
                    OwesYou: participant.user.username,
                    amount: participant.amount,
                });
            }
        }
        return users;
    }
}

function returnUserDebts(expense, username) {
    // console.log("username");
    if (expense.splitMethod === 'equal') {
        const DebtAmount = expense.amount / (expense.participants.length);
        for (let participant of expense.participants) {
            if (participant.username === username) {
                return {
                    youOwes: expense.payer.username, 
                    amount: DebtAmount,
                };
            }
        }
    }
    else {
        for (let participant of expense.customSplit) {
            if (participant.username === username) {
                return {
                    youOwes: participant.username, 
                    amount: participant.amount
                };
            }
        }
    }
}



async function getGroupExpenses(groupId, userId) {
    try {
    let ExpenseArray = [];

    const Expenses = await ExpenseSchema.find({ group: groupId })
    .populate("participants")
    .populate("customSplit.user")
    .populate("payer");
    console.log("here is the expenses length : ", Expenses.length);
    console.log("here is the current user ID: ", userId);
    const user = await UserSchema.findById(userId).select("username");
    console.log("here is the current group : ", groupId);

    if (!user)
        return ExpenseArray;
    for (let expense of Expenses) {
        let userShare = 0;
        // CASE 1: Current user paid for the expense (User is owed money / Positive Balance)
        if (String(expense.payer._id) === String(userId)) {
            if (expense.splitMethod === 'equal') {
                if (expense.participants && expense.participants.length > 0) {
                    userShare += (expense.amount - (expense.amount / expense.participants.length));
                }
                ExpenseArray.push({
                    name: expense.description,
                    userBalance: userShare,
                    details: returnOthersShares(expense, user.username)
                });
            } 
            else if (expense.splitMethod === 'custom') {
                for (let j = 0; j < expense.customSplit.length; j++) {
                    if (String(expense.customSplit[j].user._id) !== String(userId)) {
                        userShare += expense.customSplit[j].amount;
                    }
                }
                ExpenseArray.push({
                    name: expense.description,
                    userBalance: userShare,
                    details: returnOthersShares(expense, user.username)
                });
            }
        } 
        // CASE 2: Someone else paid (User owes money / Negative Balance)
        else {
            if (expense.splitMethod === 'equal') {
                if (expense.participants && expense.participants.length > 0) {
                    userShare -= (expense.amount / expense.participants.length);
                }
                ExpenseArray.push({
                    name: expense.description,
                    userBalance: userShare,
                    details: returnUserDebts(expense, user.username)
                });
            } 
            else if (expense.splitMethod === 'custom') {
                for (let j = 0; j < expense.customSplit.length; j++) {
                    if (String(expense.customSplit[j].user) === String(userId)) {
                        userShare -= expense.customSplit[j].amount;
                    }
                }
                ExpenseArray.push({
                    name: expense.description,
                    userBalance: userShare,
                    details: returnUserDebts(expense, user.username)
                });
            }
        }
    }

    return ExpenseArray;
    } catch (error) {
        console.error("Error getting group expenses:", error);
        throw error;
    }
}

module.exports = getGroupExpenses;