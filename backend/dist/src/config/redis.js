"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCachePattern = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
        const delay = Math.min(times * 100, 3000); // Back off up to max 3 seconds
        console.log(`🔄 [Redis] Reconnecting attempt #${times} in ${delay}ms...`);
        return delay;
    },
    reconnectOnError(err) {
        const targetErrors = ["READONLY", "ETIMEDOUT"];
        if (targetErrors.some((e) => err.message.includes(e))) {
            return true; // Force reconnection
        }
        return false;
    },
};
exports.redisClient = new ioredis_1.default(redisOptions);
exports.redisClient.on("connect", () => {
    console.log("⚡ [Redis] Socket connected successfully.");
});
exports.redisClient.on("ready", () => {
    console.log("🟢 [Redis] Connection ready to receive commands.");
});
exports.redisClient.on("error", (err) => {
    console.error("❌ [Redis] Connection error:", err.message);
});
exports.redisClient.on("close", () => {
    console.warn("⚠️ [Redis] Connection closed.");
});
exports.redisClient.on("reconnecting", () => {
    console.log("🔄 [Redis] Attempting connection re-establishment...");
});
const invalidateCachePattern = async (pattern) => {
    try {
        const keys = await exports.redisClient.keys(pattern);
        if (keys.length > 0) {
            await exports.redisClient.del(...keys);
            console.log(`🧹 [Redis] Cleared ${keys.length} cached keys matching "${pattern}"`);
        }
    }
    catch (error) {
        console.error(`❌ [Redis] Pattern invalidation failed for "${pattern}":`, error.message);
    }
};
exports.invalidateCachePattern = invalidateCachePattern;
