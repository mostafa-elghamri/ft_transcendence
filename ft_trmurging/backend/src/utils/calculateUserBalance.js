const roundNearest = (num) => Math.round(num);
const ExpenseSchema = require('../models/Schemas/Expenses');
const GroupSchema = require('../models/Schemas/Group');

function calculateUserBalance(ExpenseArray, userId, group) {
    try {
    let userOwes = 0;
    let OwedToUser = 0;
    // console.log("this is the group length : ", group.length);
    ExpenseArray.forEach(expense => {
        if (String(expense.payer) === String(userId)) {
            if(expense.splitMethod === 'equal') {
                if (expense.participants && expense.participants.length > 0)
                    OwedToUser += (expense.amount - (expense.amount / expense.participants.length));
            }
            else if (expense.splitMethod === 'custom') {
                for ( let j = 0; j < expense.customSplit.length; j++) {
                    if (String(expense.customSplit[j].user) !== String(userId))
                        OwedToUser += expense.customSplit[j].amount;
                }
            }
        }
        else {
            // console.log('reached');
            if(expense.splitMethod === 'equal') {
                if (expense.participants && expense.participants.length > 0)
                    userOwes += (expense.amount / expense.participants.length);
            }
            else if (expense.splitMethod === 'custom') {
                for ( let j = 0; j < expense.customSplit.length; j++) {
                    if (String(expense.customSplit[j].user) === String(userId))
                        userOwes += expense.customSplit[j].amount;
                }
            }
        }
    });
    return {
        groupName: group.name,
        groupMembersCount: group.members.length,
        userOwes: roundNearest(userOwes),
        OwedToUser: roundNearest(OwedToUser),
        NetBalance: roundNearest(OwedToUser - userOwes),
    };
    } catch (error) {
        console.error("Error calculating user balance:", error);
        throw error;
    }
}


async function getUserBalance(userId)
{
    try {
    const formattedGroups = [];
    // const userGroups = await GroupSchema.find({members: userId}).lean();
    const userGroups = await GroupSchema.find({ "members.userId": userId }).lean();
    // console.log("this is the group length : ", userGroups.length);
    for (let group of userGroups) {
        console.log("current group is : ", group.name);
        const expenses = await ExpenseSchema.find({group: group._id});
        const balance = calculateUserBalance(expenses, userId, group);
        group.expenses = expenses;
        group.userTotalBalance = balance;
        formattedGroups.push(group.userTotalBalance);
        // console.log(`in the group ${group.groupName} here's the current user's Balance : `, balance);
    }
    return formattedGroups;
    } catch (error) {
        console.error("Error getting user balance:", error);
        throw error;
    }
}

module.exports = getUserBalance;