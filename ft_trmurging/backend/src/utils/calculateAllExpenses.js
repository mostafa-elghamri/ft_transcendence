const roundDown = (num) => Math.floor(num);
const ExpenseSchema = require(`../models/Schemas/Expenses`);
const Settlement = require("../models/Schemas/Settlement");
const SettlementSchema = require(`../models/Schemas/Settlement`);

function calculateAllExpenses(userId) {
    try {
        let totalExpenses = 0;
        const expenses = ExpenseSchema.find({payer: userId});
        for(let expense of expenses) {
            if(expense.splitMethod === 'equal') {
                if (expense.participants && expense.participants.length > 0)
                    totalExpenses += (expense.amount - (expense.amount / expense.participants.length));
            }
            else if (expense.splitMethod === 'custom') {
                for ( let j = 0; j < expense.customSplit.length; j++) {
                    if (String(expense.customSplit[j].user) !== String(userId))
                        totalExpenses += expense.customSplit[j].amount;
                }
            }
        }

        let totalSettlement = 0;
        const Settlements = SettlementSchema.find({toUser: userId});
        for (let Settlement of Settlements)
        {
            if (Settlement.status === `accepted`) {
                totalSettlement += Settlement.amount; 
            }
        }
        return roundDown(totalExpenses - totalSettlement);
    } catch (error) {
        console.error("Error calculating all expenses:", error);
        throw error;
    }
}