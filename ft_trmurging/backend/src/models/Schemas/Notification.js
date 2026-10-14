const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "GROUP_INVITATION",
                "FRIEND_REQUEST",
                "EXPENSE_ADDED",
                "PAYMENT_RECEIVED",
                "TRIP_INVITATION",
                "CHAT_MESSAGE",
                "RECURRING_EXPENSE"
            ],
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notification", notificationSchema);