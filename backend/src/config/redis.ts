import Redis, { RedisOptions } from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

const redisOptions: RedisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,

  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000); // Back off up to max 3 seconds
    console.log(`🔄 [Redis] Reconnecting attempt #${times} in ${delay}ms...`);
    return delay;
  },

  reconnectOnError(err: Error) {
    const targetErrors = ["READONLY", "ETIMEDOUT"];
    if (targetErrors.some((e) => err.message.includes(e))) {
      return true; // Force reconnection
    }
    return false;
  },
};

export const redisClient = new Redis(redisOptions);

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
