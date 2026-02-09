const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Secure API Gateway is running",
  });
});

module.exports = router;
