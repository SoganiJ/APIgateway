const ApiLog = require("../models/ApiLog");
const { getRateLimitThreshold, calculateRiskScore } = require("../utils/riskScoring");

const rateLimitStore = {}; // in-memory (fast for hackathon)
const blockStatus = {}; // Track user blocks

const WINDOW_TIME = 60 * 1000; // 1 minute
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

const rateLimitMiddleware = async (req, res, next) => {
  const userId = req.user._id.toString();
  const accountType = req.user.accountType || "SAVINGS";
  const endpoint = req.baseUrl + req.path;
  const currentTime = Date.now();

  // Check if user is currently blocked
  if (blockStatus[userId] && blockStatus[userId].blockedUntil > currentTime) {
    await ApiLog.create({
      userId,
      endpoint,
      method: req.method,
      statusCode: 403,
      ipAddress: req.ip,
      isBlocked: true,
      reason: "User temporarily blocked due to rate limit violations",
      accountType,
      riskScore: 65,
      riskLevel: "HIGH",
    });

    return res.status(403).json({
      message: "Access temporarily restricted due to excessive requests. Please try again later.",
    });
  }

  if (!rateLimitStore[userId]) {
    rateLimitStore[userId] = {};
  }

  if (!rateLimitStore[userId][endpoint]) {
    rateLimitStore[userId][endpoint] = [];
  }

  // Remove old requests outside the window
  rateLimitStore[userId][endpoint] = rateLimitStore[userId][endpoint].filter(
    (time) => currentTime - time < WINDOW_TIME
  );

  // Get account-type aware rate limit threshold
  const limit = getRateLimitThreshold(accountType, endpoint);
  const currentRequestCount = rateLimitStore[userId][endpoint].length;

  if (currentRequestCount >= limit) {
    // Calculate risk score based on behavior
    const recentLogs = await ApiLog.find(
      { userId },
      {},
      { sort: { createdAt: -1 }, limit: 20 }
    );

    const riskData = await calculateRiskScore({
      userId,
      accountType,
      userLogs: recentLogs,
    });

    // Log blocked request with risk data
    await ApiLog.create({
      userId,
      endpoint,
      method: req.method,
      statusCode: 429,
      ipAddress: req.ip,
      isBlocked: true,
      reason: `Rate limit exceeded (${limit} per minute for ${accountType} account)`,
      accountType,
      riskScore: riskData.score,
      riskLevel: riskData.level,
      riskFactors: riskData.factors,
    });

    // Set temporary block if HIGH risk or repeated violations
    if (riskData.level === "HIGH" || currentRequestCount > limit * 2) {
      blockStatus[userId] = {
        blockedUntil: currentTime + BLOCK_DURATION,
        reason: riskData.level === "HIGH" ? "High risk detected" : "Repeated violations",
      };
    }

    return res.status(429).json({
      message: "Rate limit exceeded. Please try again later.",
      riskLevel: riskData.level,
    });
  }

  // Allow request - add to tracking
  rateLimitStore[userId][endpoint].push(currentTime);

  // Calculate risk score for successful request
  const recentLogs = await ApiLog.find(
    { userId },
    {},
    { sort: { createdAt: -1 }, limit: 20 }
  );

  const riskData = await calculateRiskScore({
    userId,
    accountType,
    userLogs: recentLogs,
  });

  // Log allowed request with risk context
  await ApiLog.create({
    userId,
    endpoint,
    method: req.method,
    statusCode: 200,
    ipAddress: req.ip,
    isBlocked: false,
    accountType,
    riskScore: riskData.score,
    riskLevel: riskData.level,
    riskFactors: riskData.factors,
  });

  next();
};

module.exports = rateLimitMiddleware;
