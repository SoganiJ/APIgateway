const ApiLog = require("../models/ApiLog");

const SIMULATION_WINDOW_MINUTES = 60;

const normalizePolicyInput = (policy = {}) => {
    const accountType = policy.accountType || "SAVINGS";
    const rawEndpoint = policy.endpoint || "/payment";
    const endpointMap = {
        "/payment": "/api/transfer",
        "/transfer": "/api/transfer",
        "/api/transfer": "/api/transfer",
        "/balance": "/api/balance",
        "/api/balance": "/api/balance"
    };
    const endpoint = endpointMap[rawEndpoint] || rawEndpoint;
    const rateLimit = Number(policy.rateLimit) || 100;
    const riskThreshold = Number(policy.riskThreshold) || 60;

    return {
        accountType,
        endpoint,
        rateLimit,
        riskThreshold
    };
};

const estimateImpactLevel = ({ throttledPercentage, restrictedPercentage }) => {
    const combined = Math.max(throttledPercentage, restrictedPercentage);

    if (combined >= 30) return "HIGH";
    if (combined >= 10) return "MEDIUM";
    return "LOW";
};

const simulatePolicyImpact = async (policyInput) => {
    const policy = normalizePolicyInput(policyInput);
    const since = new Date(Date.now() - SIMULATION_WINDOW_MINUTES * 60 * 1000);

    const baseFilters = {
        createdAt: { $gte: since },
        endpoint: policy.endpoint,
        accountType: policy.accountType
    };

    const aggregated = await ApiLog.aggregate([
        { $match: baseFilters },
        {
            $addFields: {
                fallbackRisk: {
                    $cond: [
                        { $eq: ["$isBlocked", true] },
                        95,
                        {
                            $cond: [
                                { $eq: ["$statusCode", 429] },
                                70,
                                {
                                    $cond: [
                                        { $gte: ["$statusCode", 500] },
                                        85,
                                        {
                                            $cond: [
                                                { $gte: ["$statusCode", 400] },
                                                60,
                                                0
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$userId",
                requestCount: { $sum: 1 },
                maxRisk: {
                    $max: {
                        $max: [
                            { $ifNull: ["$riskScore", 0] },
                            "$fallbackRisk"
                        ]
                    }
                }
            }
        }
    ]);

    const affectedUsers = aggregated.length;

    if (!affectedUsers) {
        return {
            affectedUsers: 0,
            throttledPercentage: 0,
            restrictedUsers: 0,
            estimatedImpact: "LOW"
        };
    }

    const throttledUsers = aggregated.filter(
        (item) => item.requestCount > policy.rateLimit
    ).length;
    const restrictedUsers = aggregated.filter(
        (item) => item.maxRisk >= policy.riskThreshold
    ).length;

    const totalRequests = aggregated.reduce(
        (sum, item) => sum + item.requestCount,
        0
    );
    const capacity = affectedUsers * policy.rateLimit;
    const capacityThrottledPercentage =
        capacity > 0 && totalRequests > capacity
            ? ((totalRequests - capacity) / totalRequests) * 100
            : 0;

    const throttledPercentage = Math.max(
        (throttledUsers / affectedUsers) * 100,
        capacityThrottledPercentage
    );
    const restrictedPercentage = (restrictedUsers / affectedUsers) * 100;

    return {
        affectedUsers,
        throttledPercentage: Number(throttledPercentage.toFixed(1)),
        restrictedUsers,
        estimatedImpact: estimateImpactLevel({
            throttledPercentage,
            restrictedPercentage
        })
    };
};

module.exports = {
    simulatePolicyImpact
};
