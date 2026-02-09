const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const rateLimitMiddleware = require("../middleware/rateLimit.middleware");
const loggerMiddleware = require("../middleware/logger.middleware");

// Apply security layers
router.use(authMiddleware);
router.use(rateLimitMiddleware);
router.use(loggerMiddleware);

router.get("/balance", (req, res) => {
  res.json({
    balance: "₹50,000",
    currency: "INR",
  });
});

router.post("/transfer", (req, res) => {
  res.json({
    message: "Transfer successful",
  });
});

module.exports = router;
