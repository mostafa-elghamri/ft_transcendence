const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Group`,
        required: true,
    },
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
    }], 
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: ``,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    splitMethod: {
        type: String,
        enum: ["equal", "custom"],
        default: "equal",
    },
    customSplit: [{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: true,
        },
    }],
});

const Expense = mongoose.model(`Expense`, ExpenseSchema, 'expenses');
module.exports = Expense;