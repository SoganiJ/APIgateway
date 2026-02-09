const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const ApiLog = require("../models/ApiLog");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { calculateRiskScore, formatRiskExplanation } = require("../utils/riskScoring");
const { getRateLimitMetrics, resetMetrics } = require("../middleware/gatewayRateLimit.middleware");

const ensureAdmin = (req, res) => {
    if (req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return false;
    }
    return true;
};

const getStatusFromSuccessRate = (rate) => {
    if (rate >= 98) return "healthy";
    if (rate >= 95) return "warning";
    return "critical";
};

// Admin metrics endpoint
router.get("/metrics", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [
        totalRequests,
        allowedRequests,
        blockedRequests,
        rateLimitedRequests,
        suspiciousActivities,
        totalAuthenticatedUsers,
        activeUserIds
    ] = await Promise.all([
        ApiLog.countDocuments(),
        ApiLog.countDocuments({ statusCode: 200 }),
        ApiLog.countDocuments({ isBlocked: true }),
        ApiLog.countDocuments({ statusCode: 429 }),
        ApiLog.countDocuments({
            $or: [{ isBlocked: true }, { statusCode: { $gte: 400 } }]
        }),
        User.countDocuments(),
        ApiLog.distinct("userId", { createdAt: { $gte: oneHourAgo } })
    ]);

    res.json({
        totalRequests,
        allowedRequests,
        blockedRequests,
        rateLimitedRequests,
        activeUsers: totalAuthenticatedUsers,
        suspiciousActivities
    });
});

// API traffic monitoring
router.get("/traffic", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const requestsPerMinute = await ApiLog.countDocuments({ createdAt: { $gte: oneMinuteAgo } });
    const totalEndpoints = await ApiLog.distinct("endpoint");

    const avgResponseAgg = await ApiLog.aggregate([
        { $match: { createdAt: { $gte: oneMinuteAgo } } },
        {
            $group: {
                _id: null,
                avgResponseTime: { $avg: "$responseTime" }
            }
        }
    ]);

    const peakLoadAgg = await ApiLog.aggregate([
        { $match: { createdAt: { $gte: oneHourAgo } } },
        {
            $group: {
                _id: {
                    minute: {
                        $dateToString: { format: "%Y-%m-%dT%H:%M", date: "$createdAt" }
                    }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);

    const peakLoad = peakLoadAgg.length ? peakLoadAgg[0].count : requestsPerMinute;

    const trafficAgg = await ApiLog.aggregate([
        {
            $group: {
                _id: { endpoint: "$endpoint", method: "$method" },
                requests: { $sum: 1 },
                successCount: {
                    $sum: {
                        $cond: [{ $eq: ["$statusCode", 200] }, 1, 0]
                    }
                },
                avgResponseTime: { $avg: "$responseTime" }
            }
        },
        { $sort: { requests: -1 } },
        { $limit: 12 }
    ]);

    const traffic = trafficAgg.map((item, index) => {
        const successRate = item.requests
            ? Number(((item.successCount / item.requests) * 100).toFixed(1))
            : 0;
        return {
            id: index + 1,
            endpoint: item._id.endpoint,
            method: item._id.method,
            requests: item.requests,
            avgTime: Math.round(item.avgResponseTime || 0),
            status: getStatusFromSuccessRate(successRate),
            successRate
        };
    });

    res.json({
        stats: {
            requestsPerMinute,
            avgResponseTime: Math.round(avgResponseAgg[0]?.avgResponseTime || 0),
            totalEndpoints: totalEndpoints.length,
            peakLoad
        },
        traffic
    });
});

// Suspicious activity logs
router.get("/suspicious-activity", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;

    const logs = await ApiLog.find({
        $or: [{ isBlocked: true }, { statusCode: { $gte: 400 } }]
    })
        .sort({ createdAt: -1 })
        .limit(25)
        .populate("userId", "username accountType")
        .lean();

    const activities = logs.map((log, index) => {
        const isRateLimited = log.statusCode === 429;
        const isBlocked = Boolean(log.isBlocked);
        const statusCode = log.statusCode || 0;

        let type = "suspicious";
        let action = "Suspicious request";
        let severity = "low";

        if (isBlocked) {
            type = "blocked";
            action = "User temporarily blocked";
            severity = "critical";
        } else if (isRateLimited) {
            type = "rate-limited";
            action = "Rate limit exceeded";
            severity = "medium";
        } else if (statusCode >= 500) {
            severity = "high";
            action = "Server error";
        } else if (statusCode >= 401) {
            severity = "high";
            action = "Unauthorized request";
        }

        return {
            id: log._id || index + 1,
            username: log.userId?.username || "unknown",
            userId: log.userId?._id || log.userId || null,
            accountType: log.userId?.accountType || "SAVINGS",
            action,
            type,
            severity,
            timestamp: log.createdAt,
            riskScore: log.riskScore || 0,
            riskLevel: log.riskLevel || "LOW",
            riskFactors: log.riskFactors || [],
            details: log.reason || `${log.method} ${log.endpoint} -> ${statusCode}`,
            ip: log.ipAddress || "unknown"
        };
    });

    res.json({ activities });
});

// Get user details for investigation
router.get("/user/:userId", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;

    const user = await User.findById(req.params.userId).select(
        "username apiKey role createdAt"
    );

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const recentLogs = await ApiLog.find({ userId: req.params.userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    res.json({
        user,
        recentLogs
    });
});

// Send notification to user (admin only)
router.post("/notify", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;

    const { userId, title, message, type = "alert", severity = "medium", actionRequired = false, details } = req.body;

    if (!userId || !title || !message) {
        return res.status(400).json({ message: "userId, title, and message required" });
    }

    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            severity,
            actionRequired,
            details
        });

        res.status(201).json({
            message: "Notification sent",
            notification
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get risk analysis for a specific user
router.get("/risk-analysis/:userId", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;

    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userLogs = await ApiLog.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(30)
            .lean();

        const riskData = await calculateRiskScore({
            userId: req.params.userId,
            accountType: user.accountType,
            userLogs
        });

        const explanation = formatRiskExplanation(riskData, user);

        // Get account-type policy details
        const policyMode = user.accountType === "SAVINGS" ? "Conservative" : "High-Throughput";

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                accountType: user.accountType,
                policyMode
            },
            riskAnalysis: {
                score: riskData.score,
                level: riskData.level,
                action: riskData.action,
                factors: riskData.factors,
                timestamp: riskData.timestamp
            },
            explanation,
            recentActivity: {
                totalRequests: userLogs.length,
                blockedRequests: userLogs.filter(l => l.statusCode >= 400).length,
                rateLimitedRequests: userLogs.filter(l => l.statusCode === 429).length,
                lastRequest: userLogs[0]?.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get risk dashboard - summary of all user risks
router.get("/risk-dashboard", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;

    try {
        const users = await User.find({ role: "user" }).lean();

        const riskSummary = [];

        for (const user of users) {
            const userLogs = await ApiLog.find({ userId: user._id })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            if (userLogs.length === 0) continue;

            const riskData = await calculateRiskScore({
                userId: user._id,
                accountType: user.accountType,
                userLogs
            });

            riskSummary.push({
                userId: user._id,
                username: user.username,
                accountType: user.accountType,
                policyMode: user.accountType === "SAVINGS" ? "Conservative" : "High-Throughput",
                riskScore: riskData.score,
                riskLevel: riskData.level,
                action: riskData.action,
                topRiskFactors: riskData.factors.slice(0, 2),
                timestamp: new Date()
            });
        }

        // Sort by risk score (highest first)
        riskSummary.sort((a, b) => b.riskScore - a.riskScore);

        // Summary statistics
        const highRiskUsers = riskSummary.filter(r => r.riskLevel === "HIGH");
        const mediumRiskUsers = riskSummary.filter(r => r.riskLevel === "MEDIUM");
        const avgRiskScore = riskSummary.length > 0
            ? (riskSummary.reduce((sum, r) => sum + r.riskScore, 0) / riskSummary.length).toFixed(2)
            : 0;

        res.json({
            summary: {
                totalUsers: riskSummary.length,
                highRiskCount: highRiskUsers.length,
                mediumRiskCount: mediumRiskUsers.length,
                averageRiskScore: parseFloat(avgRiskScore)
            },
            users: riskSummary
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Traffic history for charts (24 hour time-series data)
router.get("/traffic-history", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Aggregate traffic data into 4-hour buckets
    const trafficAgg = await ApiLog.aggregate([
        { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
        {
            $group: {
                _id: {
                    hour: { $hour: "$createdAt" }
                },
                total: { $sum: 1 },
                blocked: {
                    $sum: {
                        $cond: [{ $or: [{ $eq: ["$isBlocked", true] }, { $eq: ["$statusCode", 429] }] }, 1, 0]
                    }
                }
            }
        },
        { $sort: { "_id.hour": 1 } }
    ]);

    // Create time buckets for the last 24 hours (every 4 hours)
    const now = new Date();
    const buckets = [];
    for (let i = 0; i < 24; i += 4) {
        const hour = (now.getHours() - (24 - i) + 24) % 24;
        const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

        // Find data for this hour range
        const hourData = trafficAgg.filter(item =>
            item._id.hour >= hour && item._id.hour < (hour + 4)
        );

        const total = hourData.reduce((sum, item) => sum + item.total, 0);
        const blocked = hourData.reduce((sum, item) => sum + item.blocked, 0);

        buckets.push({
            time: timeLabel,
            total,
            blocked
        });
    }

    res.json(buckets);
});

// Gateway rate limit metrics endpoint
router.get("/gateway-metrics", authMiddleware, (req, res) => {
    if (!ensureAdmin(req, res)) return;

    const metrics = getRateLimitMetrics();
    res.json(metrics);
});

// Reset gateway metrics (admin only)
router.post("/reset-gateway-metrics", authMiddleware, (req, res) => {
    if (!ensureAdmin(req, res)) return;

    resetMetrics();
    res.json({ message: "Gateway metrics reset successfully" });
});

module.exports = router;
