const Redis = require("ioredis");

let redisClient = null;

const connectRedis = () => {
  try {
    // Use local Redis or cloud Redis URL
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy(times) {
        // Stop retrying after 3 attempts
        if (times > 3) {
          console.warn("⚠️  Redis unavailable - falling back to in-memory rate limiting");
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("error", (err) => {
      // Only log first error, suppress repeated errors
      if (!redisClient._errorLogged) {
        console.error("❌ Redis connection error:", err.message);
        console.warn("⚠️  Continuing without Redis - using in-memory rate limiting");
        redisClient._errorLogged = true;
      }
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis client ready");
    });

    return redisClient;
  } catch (error) {
    console.error("❌ Redis initialization failed:", error.message);
    console.warn("⚠️  Continuing without Redis - using in-memory rate limiting");
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    connectRedis();
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
