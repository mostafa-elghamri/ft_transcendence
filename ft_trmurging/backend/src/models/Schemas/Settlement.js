const mongoose = require('mongoose');

const SettlementSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Group`,
        required: true,
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true,
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        default: 0,
    },
    status:{
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Settlement = mongoose.model(`Settlement`, SettlementSchema);

module.exports = Settlement;