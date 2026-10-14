const GroupSchema = require('../models/Schemas/Group');
const ExpenseSchema = require('../models/Schemas/Expenses');
const UserSchema = require('../models/Schemas/User');

async function GroupTotalExpenses (groupId, userId) {
    try {
    groupId = '6accfbad416c4259988ceb63';
    
    const currentGroup = await GroupSchema.findById(groupId).populate("members.userId");
    const currentUser = await UserSchema.findById(userId);
    console.log('here is the current user :', currentUser.username);
    console.log("user id is : ", currentUser._id);
    const Expenses = await ExpenseSchema.find({ group: groupId })
    .populate("participants")
    .populate("customSplit.user")
    .populate("payer");
    console.log('heres the expenses length :', Expenses.length);


     const membersBalances = [];

    for (let memberObj of currentGroup.members) {
        const memberUser = memberObj.userId;
        
        if (String(memberUser._id) === String(userId)) continue;

        let balance = 0;

        for (let expense of Expenses) {
            const isCurrentUserPayer = String(expense.payer._id) === String(userId);
            const isMemberPayer = String(expense.payer._id) === String(memberUser._id);

            if (isCurrentUserPayer) {
                if (expense.splitMethod === 'equal') {
                    balance += (expense.amount / expense.participants.length);
                } else {
                    const split = expense.customSplit.find(s => String(s.user._id) === String(memberUser._id));
                    if (split) balance += split.amount;
                }
            } 
            else if (isMemberPayer) {
                if (expense.splitMethod === 'equal') {
                    balance -= (expense.amount / expense.participants.length);
                } else {
                    const split = expense.customSplit.find(s => String(s.user._id) === String(userId));
                    if (split) balance -= split.amount;
                }
            }
        }
        if (balance < 0) {
            membersBalances.push({
                youOwes: memberUser.username,
                balance: Math.round(balance)
            });
        }
        else if (balance > 0) {
            membersBalances.push({
                OwesYou: memberUser.username,
                balance: Math.round(balance)
            });
        }
    }

    return {
        groupName: currentGroup.name,
        members: membersBalances
    };
    } catch (error) {
        console.error("Error calculating group total expenses:", error);
        throw error;
    }
}

module.exports = GroupTotalExpenses;