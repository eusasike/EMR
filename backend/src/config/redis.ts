import Redis, { RedisOptions } from "ioredis";

const redisConnectionParam = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,

  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000);
    console.log(`🔄 [Redis] Reconnecting attempt #${times} in ${delay}ms...`);
    return delay;
  },

  reconnectOnError(err: Error) {
    const targetErrors = ["READONLY", "ETIMEDOUT"];
    if (targetErrors.some((e) => err.message.includes(e))) {
      return true;
    }
    return false;
  },
};

export const redisClient =
  typeof redisConnectionParam === "string"
    ? new Redis(redisConnectionParam, redisOptions)
    : new Redis({ ...redisOptions, ...redisConnectionParam });

redisClient.on("connect", () => {
  console.log("⚡ [Redis] Socket connected successfully.");
});

redisClient.on("ready", () => {
  console.log("🟢 [Redis] Connection ready to receive commands.");
});

redisClient.on("error", (err: Error) => {
  console.error("❌ [Redis] Connection error:", err.message);
});

redisClient.on("close", () => {
  console.warn("⚠️ [Redis] Connection closed.");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 [Redis] Attempting connection re-establishment...");
});

export const invalidateCachePattern = async (
  pattern: string,
): Promise<void> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(
        `🧹 [Redis] Cleared ${keys.length} cached keys matching "${pattern}"`,
      );
    }
  } catch (error: any) {
    console.error(
      `❌ [Redis] Pattern invalidation failed for "${pattern}":`,
      error.message,
    );
  }
};
