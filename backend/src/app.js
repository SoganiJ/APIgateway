const express = require("express");
const cors = require("cors");
const { gatewayRateLimitMiddleware } = require("./middleware/gatewayRateLimit.middleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
	req._startTime = Date.now();
	next();
});

// Apply gateway rate limiting to ALL /api routes BEFORE authentication
app.use("/api", gatewayRateLimitMiddleware);

// Routes
const healthRoute = require("./routes/health.route");
const authRoute = require("./routes/auth.route");
const protectedRoute = require("./routes/protected.route");
const apiRoute = require("./routes/api.route");
const adminRoute = require("./routes/admin.route");
const adminSimulationRoute = require("./routes/adminSimulation.routes");
const userRoute = require("./routes/user.route");
const chatRoute = require("./routes/chat.route");
const mlAnomalyRoute = require("./routes/mlAnomaly.route");


app.use("/health", healthRoute);
app.use("/auth", authRoute);
app.use("/protected", protectedRoute);
app.use("/api", apiRoute);
app.use("/api/admin", adminRoute);
app.use("/api/admin", adminSimulationRoute);
app.use("/api/admin", mlAnomalyRoute);
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);

module.exports = app;

