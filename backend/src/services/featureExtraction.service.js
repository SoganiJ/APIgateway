/**
 * Feature extraction from MongoDB ApiLog
 * Converts API logs into ML features for anomaly detection
 */

const ApiLog = require("../models/ApiLog");
const User = require("../models/User");

/**
 * Extract behavioral features from user's recent API activity
 * @param {String} userId - User ID or IP address
 * @param {Number} windowMinutes - Time window for analysis (default: 5 minutes)
 * @returns {Object} Feature vector for ML model
 */
const buildFeaturesFromLogs = async ({ logs, windowMinutes, identifier }) => {
    if (logs.length === 0) {
        return null;
    }

    const now = new Date();

    // Calculate features
    const requests_per_minute = logs.length / windowMinutes;

    // Burst detection: count sequences of 3+ requests within 10 seconds
    let burst_count = 0;
    for (let i = 0; i < logs.length - 2; i++) {
        const time1 = new Date(logs[i].createdAt).getTime();
        const time3 = new Date(logs[i + 2].createdAt).getTime();
        if ((time3 - time1) < 10000) {
            burst_count++;
        }
    }

    // Unique endpoints accessed
    const unique_endpoints = new Set(logs.map(log => log.endpoint)).size;

    // Average interval between requests (ms)
    let total_interval = 0;
    for (let i = 1; i < logs.length; i++) {
        const interval = new Date(logs[i].createdAt).getTime() -
                        new Date(logs[i - 1].createdAt).getTime();
        total_interval += interval;
    }
    const avg_interval_ms = logs.length > 1 ? Math.round(total_interval / (logs.length - 1)) : 2000;

    // Check if user is authenticated
    let is_authenticated = 0;
    if (identifier.type === "user") {
        const user = await User.findById(identifier.value);
        is_authenticated = user ? 1 : 0;
    }

    // Time of day (0-23)
    const time_of_day = now.getHours();

    // Failed requests count
    const failed_requests = logs.filter(log => log.statusCode >= 400).length;

    // Rate limit hits
    const rate_limit_hits = logs.filter(log => log.statusCode === 429 || log.isBlocked).length;

    return {
        identifierType: identifier.type,
        identifierValue: identifier.value,
        userId: identifier.type === "user" ? identifier.value : null,
        ipAddress: identifier.type === "ip" ? identifier.value : null,
        requests_per_minute: Math.round(requests_per_minute),
        burst_count,
        unique_endpoints,
        avg_interval_ms,
        is_authenticated,
        time_of_day,
        failed_requests,
        rate_limit_hits,
        total_requests: logs.length,
        window_minutes: windowMinutes,
        timestamp: now
    };
};

async function extractFeatures(userId, windowMinutes = 5) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
    
    // Get user's recent logs
    const logs = await ApiLog.find({
        userId: userId,
        createdAt: { $gte: windowStart }
    }).sort({ createdAt: 1 }).lean();
    
    return buildFeaturesFromLogs({
        logs,
        windowMinutes,
        identifier: { type: "user", value: userId }
    });
}

/**
 * Extract features for all active users in last N minutes
 * @param {Number} windowMinutes - Time window for analysis
 * @returns {Array} Array of feature vectors
 */
async function extractBatchFeatures(windowMinutes = 5) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
    
    // Get all active users in this window
    const activeUserIds = await ApiLog.distinct("userId", {
        createdAt: { $gte: windowStart }
    });

    const activeIps = await ApiLog.distinct("ipAddress", {
        createdAt: { $gte: windowStart },
        userId: null,
        ipAddress: { $ne: null }
    });
    
    const features = [];
    for (const userId of activeUserIds) {
        if (userId) {
            const userFeatures = await extractFeatures(userId, windowMinutes);
            if (userFeatures) {
                features.push(userFeatures);
            }
        }
    }

    for (const ipAddress of activeIps) {
        if (!ipAddress) continue;

        const logs = await ApiLog.find({
            userId: null,
            ipAddress,
            createdAt: { $gte: windowStart }
        }).sort({ createdAt: 1 }).lean();

        const ipFeatures = await buildFeaturesFromLogs({
            logs,
            windowMinutes,
            identifier: { type: "ip", value: ipAddress }
        });

        if (ipFeatures) {
            features.push(ipFeatures);
        }
    }
    
    return features;
}

/**
 * Generate training data from historical logs
 * @param {Number} hours - Hours of historical data to use
 * @param {Number} sampleInterval - Minutes between samples
 * @returns {Array} Training data
 */
async function generateTrainingData(hours = 24, sampleInterval = 5) {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    // Get all users who were active in this period
    const activeUserIds = await ApiLog.distinct("userId", {
        createdAt: { $gte: startTime }
    });
    
    const trainingData = [];
    
    for (const userId of activeUserIds) {
        if (!userId) continue;
        
        // Get all logs for this user
        const userLogs = await ApiLog.find({
            userId: userId,
            createdAt: { $gte: startTime }
        }).sort({ createdAt: 1 }).lean();
        
        if (userLogs.length < 5) continue;
        
        // Split into time windows and extract features
        const windowMs = sampleInterval * 60 * 1000;
        const windows = {};
        
        for (const log of userLogs) {
            const logTime = new Date(log.createdAt).getTime();
            const windowKey = Math.floor((logTime - startTime.getTime()) / windowMs);
            
            if (!windows[windowKey]) {
                windows[windowKey] = [];
            }
            windows[windowKey].push(log);
        }
        
        // Extract features for each window
        for (const logs of Object.values(windows)) {
            if (logs.length < 2) continue;
            
            // Calculate features (simplified version)
            const requests_per_minute = (logs.length / sampleInterval);
            
            let burst_count = 0;
            for (let i = 0; i < logs.length - 2; i++) {
                const time1 = new Date(logs[i].createdAt).getTime();
                const time3 = new Date(logs[i + 2].createdAt).getTime();
                if ((time3 - time1) < 10000) burst_count++;
            }
            
            const unique_endpoints = new Set(logs.map(l => l.endpoint)).size;
            
            let total_interval = 0;
            for (let i = 1; i < logs.length; i++) {
                total_interval += new Date(logs[i].createdAt).getTime() - 
                                 new Date(logs[i - 1].createdAt).getTime();
            }
            const avg_interval_ms = Math.round(total_interval / (logs.length - 1));
            
            const time_of_day = new Date(logs[0].createdAt).getHours();
            const failed_requests = logs.filter(l => l.statusCode >= 400).length;
            const rate_limit_hits = logs.filter(l => l.statusCode === 429 || l.isBlocked).length;
            
            trainingData.push({
                requests_per_minute: Math.round(requests_per_minute),
                burst_count,
                unique_endpoints,
                avg_interval_ms,
                is_authenticated: 1,
                time_of_day,
                failed_requests,
                rate_limit_hits
            });
        }
    }
    
    return trainingData;
}

module.exports = {
    extractFeatures,
    extractBatchFeatures,
    generateTrainingData
};
