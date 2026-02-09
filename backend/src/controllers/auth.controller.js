const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateApiKey = require("../utils/generateApiKey");

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { username, accountType = "SAVINGS" } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!["SAVINGS", "CURRENT"].includes(accountType)) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const apiKey = generateApiKey();

    const user = await User.create({
      username,
      apiKey,
      accountType,
    });

    res.status(201).json({
      message: "User registered successfully",
      username: user.username,
      apiKey: user.apiKey,
      accountType: user.accountType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { username, apiKey } = req.body;

    if (!username || !apiKey) {
      return res
        .status(400)
        .json({ message: "Username and API key required" });
    }

    const user = await User.findOne({ username, apiKey });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      accountType: user.accountType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
