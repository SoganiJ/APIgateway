const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { simulatePolicyImpact } = require("../services/policySimulation.service");

const ensureAdmin = (req, res) => {
    if (req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return false;
    }
    return true;
};

// This endpoint does NOT enforce policies. It only simulates potential impact.
router.post("/simulate-policy", authMiddleware, async (req, res) => {
    if (!ensureAdmin(req, res)) return;

    const { accountType, endpoint, rateLimit, riskThreshold } = req.body || {};

    if (!accountType || !endpoint || rateLimit === undefined || riskThreshold === undefined) {
        return res.status(400).json({
            message: "accountType, endpoint, rateLimit, and riskThreshold are required"
        });
    }

    try {
        const simulation = await simulatePolicyImpact({
            accountType,
            endpoint,
            rateLimit,
            riskThreshold
        });

        res.json(simulation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
