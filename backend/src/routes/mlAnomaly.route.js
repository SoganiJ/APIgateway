const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const mlServiceClient = require("../services/mlService.client");
const { extractFeatures, extractBatchFeatures, generateTrainingData } = require("../services/featureExtraction.service");

const ensureAdmin = (req, res) => {
    if (!req.user || req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return false;
    }
    return true;
};

// Get ML service health
router.get("/ml/health", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    
    const health = await mlServiceClient.health();
    res.json(health);
});

// Get ML model information
router.get("/ml/model-info", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    
    const info = await mlServiceClient.getModelInfo();
    res.json(info);
});

// Train ML model with historical data
router.post("/ml/train", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    
    try {
        const { hours = 24, sampleInterval = 5 } = req.body;
        
        console.log(`🧠 Generating training data from last ${hours} hours...`);
        const trainingData = await generateTrainingData(hours, sampleInterval);
        
        if (trainingData.length < 10) {
            return res.status(400).json({
                error: "Insufficient data for training",
                message: `Need at least 10 samples, found ${trainingData.length}`,
                suggestion: "Generate more API traffic or reduce time window"
            });
        }
        
        console.log(`📊 Training with ${trainingData.length} samples...`);
        const result = await mlServiceClient.train(trainingData);
        
        res.json({
            ...result,
            trainingDataSize: trainingData.length,
            timeRange: `${hours} hours`,
            message: "Model trained successfully"
        });
    } catch (error) {
        console.error("Training error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get real-time anomaly detection for all active users
router.get("/ml/anomalies", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    
    try {
        const windowMinutes = parseInt(req.query.window) || 5;
        
        // Extract features for all active users
        const featuresArray = await extractBatchFeatures(windowMinutes);
        
        if (featuresArray.length === 0) {
            return res.json({
                anomalies: [],
                totalUsers: 0,
                message: "No active users in the specified window"
            });
        }
        
        // Get predictions from ML service
        const predictions = await mlServiceClient.predictBatch(
            featuresArray.map(f => ({
                requests_per_minute: f.requests_per_minute,
                burst_count: f.burst_count,
                unique_endpoints: f.unique_endpoints,
                avg_interval_ms: f.avg_interval_ms,
                is_authenticated: f.is_authenticated,
                time_of_day: f.time_of_day,
                failed_requests: f.failed_requests,
                rate_limit_hits: f.rate_limit_hits
            }))
        );

        const predictionList = Array.isArray(predictions?.predictions)
            ? predictions.predictions
            : featuresArray.map(() => ({
                anomaly_score: 0.0,
                is_anomaly: false,
                risk_level: 'LOW',
                action: 'Allow',
                reason: 'ML service unavailable',
                error: true
            }));
        
        // Merge features with predictions
        const anomalies = featuresArray.map((features, index) => ({
            userId: features.userId,
            ipAddress: features.ipAddress || null,
            identifierType: features.identifierType,
            identifierValue: features.identifierValue,
            ...predictionList[index],
            total_requests: features.total_requests,
            timestamp: features.timestamp
        }));
        
        // Sort by anomaly score (highest first)
        anomalies.sort((a, b) => b.anomaly_score - a.anomaly_score);
        
        // Get user details for top anomalies
        const User = require("../models/User");
        for (const anomaly of anomalies.slice(0, 20)) {
            if (anomaly.identifierType === "user" && anomaly.userId) {
                const user = await User.findById(anomaly.userId).select("username email accountType");
                if (user) {
                    anomaly.username = user.username;
                    anomaly.email = user.email;
                    anomaly.accountType = user.accountType;
                }
            } else if (anomaly.identifierType === "ip") {
                anomaly.username = `IP: ${anomaly.identifierValue}`;
                anomaly.accountType = "ANONYMOUS";
            }
        }
        
        res.json({
            anomalies,
            totalUsers: anomalies.length,
            highRisk: anomalies.filter(a => a.anomaly_score > 0.8).length,
            mediumRisk: anomalies.filter(a => a.anomaly_score >= 0.5 && a.anomaly_score <= 0.8).length,
            lowRisk: anomalies.filter(a => a.anomaly_score < 0.5).length,
            windowMinutes
        });
    } catch (error) {
        console.error("Anomaly detection error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get anomaly prediction for specific user
router.get("/ml/anomalies/:userId", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    
    try {
        const { userId } = req.params;
        const windowMinutes = parseInt(req.query.window) || 5;
        
        // Extract features for this user
        const features = await extractFeatures(userId, windowMinutes);
        
        if (!features) {
            return res.status(404).json({
                error: "No recent activity found for this user"
            });
        }
        
        // Get prediction
        const prediction = await mlServiceClient.predict({
            requests_per_minute: features.requests_per_minute,
            burst_count: features.burst_count,
            unique_endpoints: features.unique_endpoints,
            avg_interval_ms: features.avg_interval_ms,
            is_authenticated: features.is_authenticated,
            time_of_day: features.time_of_day,
            failed_requests: features.failed_requests,
            rate_limit_hits: features.rate_limit_hits
        });
        
        // Get user details
        const User = require("../models/User");
        const user = await User.findById(userId).select("username email accountType");
        
        res.json({
            userId,
            username: user?.username || "unknown",
            email: user?.email,
            accountType: user?.accountType,
            ...prediction,
            total_requests: features.total_requests,
            windowMinutes,
            timestamp: features.timestamp
        });
    } catch (error) {
        console.error("User anomaly detection error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get anomaly statistics
router.get("/ml/stats", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    
    try {
        const windowMinutes = parseInt(req.query.window) || 5;
        
        // Get all anomalies
        const featuresArray = await extractBatchFeatures(windowMinutes);
        
        if (featuresArray.length === 0) {
            return res.json({
                totalUsers: 0,
                criticalUsers: 0,
                highRiskUsers: 0,
                mediumRiskUsers: 0,
                lowRiskUsers: 0,
                avgAnomalyScore: 0
            });
        }
        
        const predictions = await mlServiceClient.predictBatch(
            featuresArray.map(f => ({
                requests_per_minute: f.requests_per_minute,
                burst_count: f.burst_count,
                unique_endpoints: f.unique_endpoints,
                avg_interval_ms: f.avg_interval_ms,
                is_authenticated: f.is_authenticated,
                time_of_day: f.time_of_day,
                failed_requests: f.failed_requests,
                rate_limit_hits: f.rate_limit_hits
            }))
        );

        const predictionList = Array.isArray(predictions?.predictions)
            ? predictions.predictions
            : featuresArray.map(() => ({
                anomaly_score: 0.0,
                is_anomaly: false,
                risk_level: 'LOW',
                action: 'Allow',
                reason: 'ML service unavailable',
                error: true
            }));
        
        const scores = predictionList.map(p => p.anomaly_score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        res.json({
            totalUsers: featuresArray.length,
            criticalUsers: predictionList.filter(p => p.anomaly_score > 0.9).length,
            highRiskUsers: predictionList.filter(p => p.anomaly_score > 0.8 && p.anomaly_score <= 0.9).length,
            mediumRiskUsers: predictionList.filter(p => p.anomaly_score >= 0.5 && p.anomaly_score <= 0.8).length,
            lowRiskUsers: predictionList.filter(p => p.anomaly_score < 0.5).length,
            avgAnomalyScore: avgScore.toFixed(3),
            windowMinutes
        });
    } catch (error) {
        console.error("Anomaly stats error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
