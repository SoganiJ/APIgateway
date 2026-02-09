const mongoose = require("mongoose");

const apiLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ["SAVINGS", "CURRENT", "ANONYMOUS"],
      default: "SAVINGS",
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
    riskFactors: [
      {
        factor: String,
        contribution: Number,
        details: String,
      },
    ],
    responseTime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApiLog", apiLogSchema);
