const ApiLog = require("../models/ApiLog");

// Rate limit configurations
const RATE_LIMITS = {
  AUTHENTICATED: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60 * 1000, // 1 minute
    BLOCK_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  },
  ANONYMOUS: {
    MAX_REQUESTS: 50,
    WINDOW_MS: 60 * 1000, // 1 minute
    BLOCK_DURATION_MS: 10 * 60 * 1000, // 10 minutes
  },
};

// In-memory storage for rate limiting
const memoryStore = new Map();
const blockedStore = new Map();

// Global metrics for admin dashboard
const rateLimitMetrics = {
  totalRequests: 0,
  blockedRequests: 0,
  activeOffenders: new Set(),
  resetTime: Date.now(),
};

const getClientIdentifier = (req) => {
  // Prefer user ID for authenticated requests
  if (req.user && req.user._id) {
    return `user:${req.user._id}`;
  }

  // Fall back to IP for anonymous requests
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.ip || req.connection?.remoteAddress || "unknown";
  return `ip:${ip}`;
};

const getRateLimitConfig = (req) => {
  return req.user ? RATE_LIMITS.AUTHENTICATED : RATE_LIMITS.ANONYMOUS;
};

const checkMemoryRateLimit = (identifier, config) => {
  const now = Date.now();
  const windowStart = now - config.WINDOW_MS;

  // Check if blocked
  const blockInfo = blockedStore.get(identifier);
  if (blockInfo && blockInfo.until > now) {
    return {
      limited: true,
      blocked: true,
      retryAfter: Math.ceil((blockInfo.until - now) / 1000),
    };
  } else if (blockInfo) {
    blockedStore.delete(identifier);
  }

  // Get or initialize request timestamps
  let timestamps = memoryStore.get(identifier) || [];
  timestamps = timestamps.filter((ts) => ts > windowStart);

  if (timestamps.length >= config.MAX_REQUESTS) {
    // Block the identifier
    blockedStore.set(identifier, {
      until: now + config.BLOCK_DURATION_MS,
      reason: "Rate limit exceeded",
    });

    return {
      limited: true,
      blocked: true,
      retryAfter: Math.floor(config.BLOCK_DURATION_MS / 1000),
      current: timestamps.length,
      limit: config.MAX_REQUESTS,
    };
  }

  // Add current timestamp
  timestamps.push(now);
  memoryStore.set(identifier, timestamps);

  return {
    limited: false,
    current: timestamps.length,
    limit: config.MAX_REQUESTS,
    remaining: config.MAX_REQUESTS - timestamps.length,
    resetAt: now + config.WINDOW_MS,
  };
};

const gatewayRateLimitMiddleware = async (req, res, next) => {
  // Skip rate limiting for health checks
  if (req.path === "/health" || req.path.startsWith("/health")) {
    return next();
  }

  const identifier = getClientIdentifier(req);
  const config = getRateLimitConfig(req);

  // Update metrics
  rateLimitMetrics.totalRequests++;

  // Check rate limit using in-memory storage
  const result = checkMemoryRateLimit(identifier, config);

  // Set rate limit headers
  if (result.current !== undefined) {
    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining || 0);
  }

  if (result.resetAt) {
    res.setHeader("X-RateLimit-Reset", new Date(result.resetAt).toISOString());
  }

  if (result.limited) {
    // Update metrics
    rateLimitMetrics.blockedRequests++;
    rateLimitMetrics.activeOffenders.add(identifier);

    // Log blocked request
    try {
      await ApiLog.create({
        userId: req.user?._id || null,
        endpoint: req.baseUrl + req.path,
        method: req.method,
        statusCode: 429,
        ipAddress: identifier.startsWith("ip:") ? identifier.replace("ip:", "") : "N/A",
        isBlocked: true,
        reason: "Gateway rate limit exceeded",
        accountType: req.user?.accountType || "SAVINGS",
        riskScore: 75,
        riskLevel: "HIGH",
        riskFactors: [
          {
            factor: "Rate limit violation",
            contribution: 75,
            details: `Exceeded ${config.MAX_REQUESTS} requests per minute`,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to log rate limit violation:", error.message);
    }

    res.setHeader("Retry-After", result.retryAfter);
    return res.status(429).json({
      error: "Too Many Requests",
      message: result.blocked
        ? "Rate limit exceeded. Access temporarily blocked."
        : "Too many requests. Please slow down.",
      retryAfter: result.retryAfter,
      limit: result.limit,
      current: result.current,
    });
  }

  // Allow request
  next();
};

// Get metrics for admin dashboard
const getRateLimitMetrics = () => {
  return {
    totalRequests: rateLimitMetrics.totalRequests,
    blockedRequests: rateLimitMetrics.blockedRequests,
    allowedRequests: rateLimitMetrics.totalRequests - rateLimitMetrics.blockedRequests,
    activeOffenders: rateLimitMetrics.activeOffenders.size,
    blockRate:
      rateLimitMetrics.totalRequests > 0
        ? ((rateLimitMetrics.blockedRequests / rateLimitMetrics.totalRequests) * 100).toFixed(2)
        : "0.00",
    uptime: Date.now() - rateLimitMetrics.resetTime,
  };
};

// Reset metrics (for testing or periodic reset)
const resetMetrics = () => {
  rateLimitMetrics.totalRequests = 0;
  rateLimitMetrics.blockedRequests = 0;
  rateLimitMetrics.activeOffenders.clear();
  rateLimitMetrics.resetTime = Date.now();
};

module.exports = {
  gatewayRateLimitMiddleware,
  getRateLimitMetrics,
  resetMetrics,
  RATE_LIMITS,
};
