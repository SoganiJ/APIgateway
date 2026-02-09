const ApiLog = require("../models/ApiLog");
const { calculateRiskScore } = require("../utils/riskScoring");

const deriveRiskLevel = (score) => {
  if (score > 60) return "HIGH";
  if (score > 30) return "MEDIUM";
  return "LOW";
};

const loggerMiddleware = async (req, res, next) => {
  res.on("finish", async () => {
    try {
      const accountType = req.user?.accountType || "SAVINGS";
      const recentLogs = req.user?._id
        ? await ApiLog.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
        : [];

      const riskData = req.user?._id
        ? await calculateRiskScore({
            userId: req.user._id,
            accountType,
            userLogs: recentLogs
          })
        : { score: 0, level: "LOW", factors: [] };

      let derivedScore = riskData.score || 0;
      const riskFactors = [...(riskData.factors || [])];

      if (res.statusCode >= 500) {
        derivedScore = Math.max(derivedScore, 80);
        riskFactors.push({
          factor: "Server error",
          contribution: 20,
          details: `Status code ${res.statusCode}`
        });
      } else if (res.statusCode >= 400) {
        derivedScore = Math.max(derivedScore, 45);
        riskFactors.push({
          factor: "Client error",
          contribution: 15,
          details: `Status code ${res.statusCode}`
        });
      }

      const riskScore = Math.min(derivedScore, 100);
      const riskLevel = deriveRiskLevel(riskScore);

      await ApiLog.create({
        userId: req.user ? req.user._id : null,
        endpoint: req.baseUrl + req.path,
        method: req.method,
        statusCode: res.statusCode,
        ipAddress: req.ip,
        isBlocked: res.statusCode >= 400,
        accountType,
        riskScore,
        riskLevel,
        riskFactors
      });
    } catch (error) {
      console.error("ApiLog error:", error.message);
    }
  });

  next();
};

module.exports = loggerMiddleware;
