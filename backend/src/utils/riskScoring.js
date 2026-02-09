/**
 * Risk Scoring Engine
 * 
 * Provides explainable, rule-based risk scoring for users
 * Does NOT replace rate limiting - augments it with intelligence
 * 
 * Risk Score Range: 0-100
 * - 0-30: LOW (Allow)
 * - 31-60: MEDIUM (Throttle/Restricted)
 * - 61-100: HIGH (Temporary block)
 */

const ApiLog = require("../models/ApiLog");

// Risk scoring weights - adjustable for fine-tuning
const RISK_WEIGHTS = {
    SAVINGS: {
        highRequestRate: 30,
        rateLimitViolation: 25,
        sensitiveEndpoint: 20,
        failedAuth: 40,
    },
    CURRENT: {
        highRequestRate: 15,
        rateLimitViolation: 15,
        sensitiveEndpoint: 10,
        failedAuth: 30,
    },
};

// Request rate thresholds per minute (account-type aware)
const RATE_THRESHOLDS = {
    SAVINGS: {
        "/api/balance": 10,
        "/api/transfer": 3,
    },
    CURRENT: {
        "/api/balance": 20, // Higher throughput tolerance
        "/api/transfer": 5,
    },
};

// Sensitive endpoints that trigger risk increase
const SENSITIVE_ENDPOINTS = ["/api/transfer", "/api/payment"];

/**
 * Calculate risk score for a user based on behavioral signals
 * 
 * @param {Object} userContext - { userId, accountType, recentLogs }
 * @returns {Object} - { score, level, factors, action }
 */
async function calculateRiskScore(userContext) {
    const { userId, accountType = "SAVINGS", userLogs = [] } = userContext;

    let riskScore = 0;
    const riskFactors = [];

    // Get weights for account type
    const weights = RISK_WEIGHTS[accountType] || RISK_WEIGHTS.SAVINGS;

    // Factor 1: High request rate (requests in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentRequests = userLogs.filter(
        (log) => new Date(log.createdAt) > fiveMinutesAgo
    ).length;

    if (recentRequests > 20) {
        riskScore += weights.highRequestRate;
        riskFactors.push({
            factor: "High request rate",
            contribution: weights.highRequestRate,
            details: `${recentRequests} requests in last 5 minutes`,
        });
    }

    // Factor 2: Repeated rate-limit violations (429 responses)
    const rateLimitViolations = userLogs.filter(
        (log) => log.statusCode === 429
    ).length;

    if (rateLimitViolations > 2) {
        riskScore += weights.rateLimitViolation;
        riskFactors.push({
            factor: "Repeated rate-limit violations",
            contribution: weights.rateLimitViolation,
            details: `${rateLimitViolations} rate limit hits detected`,
        });
    }

    // Factor 3: Accessing sensitive endpoints
    const sensitiveAccess = userLogs.filter((log) =>
        SENSITIVE_ENDPOINTS.some((endpoint) => log.endpoint.includes(endpoint))
    ).length;

    if (sensitiveAccess > 3) {
        riskScore += weights.sensitiveEndpoint;
        riskFactors.push({
            factor: "Repeated sensitive endpoint access",
            contribution: weights.sensitiveEndpoint,
            details: `${sensitiveAccess} accesses to /transfer or /payment`,
        });
    }

    // Factor 4: Failed authentication attempts (401 responses)
    const failedAuthAttempts = userLogs.filter(
        (log) => log.statusCode === 401
    ).length;

    if (failedAuthAttempts > 2) {
        riskScore += weights.failedAuth;
        riskFactors.push({
            factor: "Failed authentication attempts",
            contribution: weights.failedAuth,
            details: `${failedAuthAttempts} failed auth attempts`,
        });
    }

    // Cap score at 100
    riskScore = Math.min(riskScore, 100);

    // Determine risk level
    let riskLevel = "LOW";
    let action = "Allowed";

    if (riskScore > 60) {
        riskLevel = "HIGH";
        action = "Temporary block applied";
    } else if (riskScore > 30) {
        riskLevel = "MEDIUM";
        action = "Throttled / Restricted";
    }

    return {
        score: riskScore,
        level: riskLevel,
        factors: riskFactors,
        action,
        timestamp: new Date(),
    };
}

/**
 * Get rate limit threshold for an endpoint based on account type
 * 
 * @param {String} accountType - SAVINGS or CURRENT
 * @param {String} endpoint - API endpoint
 * @returns {Number} - Requests allowed per minute
 */
function getRateLimitThreshold(accountType, endpoint) {
    const accountThresholds = RATE_THRESHOLDS[accountType] || RATE_THRESHOLDS.SAVINGS;
    return accountThresholds[endpoint] || 5; // Default to 5 if not found
}

/**
 * Determine if user should be throttled based on account type
 * 
 * @param {String} accountType - SAVINGS or CURRENT
 * @param {Number} currentRequestCount - Requests in current window
 * @param {String} endpoint - API endpoint
 * @returns {Boolean} - true if request should be blocked
 */
function shouldThrottle(accountType, currentRequestCount, endpoint) {
    const threshold = getRateLimitThreshold(accountType, endpoint);
    return currentRequestCount >= threshold;
}

/**
 * Build human-readable risk explanation for admins
 * 
 * @param {Object} riskData - From calculateRiskScore
 * @param {Object} user - User object with accountType
 * @returns {String} - Formatted explanation
 */
function formatRiskExplanation(riskData, user) {
    let explanation = `User: ${user.username} (${user.accountType} Account)\n`;
    explanation += `Risk Score: ${riskData.score} (${riskData.level})\n`;
    explanation += `Action Taken: ${riskData.action}\n\n`;
    explanation += `Risk Factors:\n`;

    if (riskData.factors.length === 0) {
        explanation += "• Normal behavior detected\n";
    } else {
        riskData.factors.forEach((factor) => {
            explanation += `• ${factor.factor} (+${factor.contribution})\n`;
            explanation += `  → ${factor.details}\n`;
        });
    }

    return explanation;
}

module.exports = {
    calculateRiskScore,
    getRateLimitThreshold,
    shouldThrottle,
    formatRiskExplanation,
    RISK_WEIGHTS,
    RATE_THRESHOLDS,
};
