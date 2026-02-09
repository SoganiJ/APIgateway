const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

router.get("/test", authMiddleware, (req, res) => {
  res.json({
    message: "You have accessed a protected route",
    user: {
      username: req.user.username,
      role: req.user.role,
    },
  });
});

module.exports = router;
