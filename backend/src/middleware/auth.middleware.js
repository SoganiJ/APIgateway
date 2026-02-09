const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Get token from header
    const authHeader = req.headers.authorization;
    const apiKey = req.headers["x-api-key"];

    if (!authHeader || !apiKey) {
      return res.status(401).json({
        message: "Authorization token and API key required",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    // 3️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Find user using decoded userId & apiKey
    const user = await User.findOne({
      _id: decoded.userId,
      apiKey: apiKey,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 5️⃣ Attach user to request
    req.user = user;

    next(); // allow request to continue
  } catch (error) {
    return res.status(401).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;

