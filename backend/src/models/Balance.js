const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        balance: {
            type: Number,
            default: 10000,
            min: 0,
        },
        transactions: [
            {
                type: {
                    type: String,
                    enum: ["debit", "credit"],
                },
                amount: Number,
                description: String,
                recipient: String,
                transactionId: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Balance", balanceSchema);
