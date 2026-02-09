const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const ApiLog = require("../models/ApiLog");
const User = require("../models/User");
const Balance = require("../models/Balance");

// Get user dashboard stats
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const userAccountType = req.user.accountType || "SAVINGS";

        // Get all user's API logs
        const allLogs = await ApiLog.find({ userId }).sort({ createdAt: -1 });

        const totalRequests = allLogs.length;
        const allowedRequests = allLogs.filter(log => log.statusCode === 200).length;
        const blockedRequests = allLogs.filter(log => log.isBlocked === true).length;
        const rateLimitedRequests = allLogs.filter(log => log.statusCode === 429).length;

        // Get user's account info
        const user = await User.findById(userId);
        let userBalance = await Balance.findOne({ userId });
        if (!userBalance) {
            userBalance = await Balance.create({ userId, balance: 10000 });
        }
        const balance = userBalance.balance;

        res.json({
            totalRequests,
            allowedRequests,
            blockedRequests,
            rateLimitedRequests,
            balance,
            accountType: userAccountType,
            successRate: totalRequests > 0 ? ((allowedRequests / totalRequests) * 100).toFixed(2) : 100,
        });
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
});

// Get user activity history
router.get("/activity", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const limit = req.query.limit || 20;

        const activities = await ApiLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Format activities for frontend
        const formattedActivities = activities.map(log => ({
            id: log._id,
            type: log.endpoint.includes("/transfer") || log.endpoint.includes("/payment") ? "payment" : "api",
            action: `${log.method} ${log.endpoint}`,
            status: log.statusCode === 200 ? "success" : log.statusCode === 429 ? "rate-limited" : "failed",
            details: log.reason || `Status: ${log.statusCode}`,
            timestamp: log.createdAt,
            endpoint: log.endpoint,
            method: log.method,
            statusCode: log.statusCode,
            isBlocked: log.isBlocked,
        }));

        res.json({ activities: formattedActivities });
    } catch (error) {
        console.error("Error fetching activities:", error);
        res.status(500).json({ message: "Failed to fetch activity history" });
    }
});

// Get user notifications
router.get("/notifications", authMiddleware, async (req, res) => {
    try {
        const Notification = require("../models/Notification");
        const userId = req.user._id.toString();
        const limit = req.query.limit || 10;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        res.json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});

// Get user's current account type policy
router.get("/policy", authMiddleware, async (req, res) => {
    try {
        const userAccountType = req.user.accountType || "SAVINGS";

        const policies = {
            SAVINGS: {
                type: "SAVINGS",
                mode: "Conservative",
                description: "Optimized for security with stricter rate limits",
                limits: {
                    balance: "10 requests/minute",
                    transfer: "3 requests/minute",
                },
                riskWeights: {
                    highRequestRate: 30,
                    rateLimitViolation: 25,
                    sensitiveEndpoint: 20,
                    failedAuth: 40,
                },
            },
            CURRENT: {
                type: "CURRENT",
                mode: "High-Throughput",
                description: "Optimized for high-frequency operations with higher rate limits",
                limits: {
                    balance: "20 requests/minute",
                    transfer: "5 requests/minute",
                },
                riskWeights: {
                    highRequestRate: 15,
                    rateLimitViolation: 15,
                    sensitiveEndpoint: 10,
                    failedAuth: 30,
                },
            },
        };

        res.json(policies[userAccountType] || policies.SAVINGS);
    } catch (error) {
        console.error("Error fetching policy:", error);
        res.status(500).json({ message: "Failed to fetch policy" });
    }
});

module.exports = router;
