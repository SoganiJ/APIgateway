const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["warning", "alert", "suspicious", "blocked", "info"],
            default: "info"
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium"
        },
        read: {
            type: Boolean,
            default: false
        },
        actionRequired: {
            type: Boolean,
            default: false
        },
        details: {
            endpoint: String,
            reason: String,
            ipAddress: String,
            timestamp: Date
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
