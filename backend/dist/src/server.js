"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const logger_1 = require("./config/logger");
const redis_1 = require("./config/redis");
const database_1 = require("./config/database");
const PORT = Number(process.env.PORT) || 4000;
// Create HTTP Server
const server = http_1.default.createServer(app_1.app);
server.listen(PORT, () => {
    logger_1.logger.info(`🚀 Server running on port ${PORT} [http://localhost:${PORT}]`);
    logger_1.logger.info(`📚 Swagger docs available at [http://localhost:${PORT}/docs]`);
});
let isShuttingDown = false;
const gracefulShutdown = async (signal) => {
    if (isShuttingDown)
        return;
    isShuttingDown = true;
    logger_1.logger.info(`🛑 [${signal}] Received shutdown signal. Initiating graceful shutdown...`);
    // Force shutdown if cleanup takes longer than 10 seconds
    const forceShutdownTimeout = setTimeout(() => {
        logger_1.logger.error("❌ Shutdown timed out! Forcing process exit.");
        process.exit(1);
    }, 10000);
    try {
        // Step 1: Stop HTTP Server from taking new requests
        await new Promise((resolve, reject) => {
            server.close((err) => {
                if (err)
                    return reject(err);
                logger_1.logger.info("🔒 [HTTP Server] Closed successfully. No longer accepting requests.");
                resolve();
            });
        });
        // Step 2: Gracefully disconnect Redis
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await redis_1.redisClient.quit();
            logger_1.logger.info("🔒 [Redis] Disconnected gracefully.");
        }
        // Step 3: Disconnect Prisma Database Connection
        await database_1.prisma.$disconnect();
        logger_1.logger.info("🔒 [Prisma] Database connection closed.");
        clearTimeout(forceShutdownTimeout);
        logger_1.logger.info("✅ Graceful shutdown completed cleanly. Exiting process.");
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error({ err: error }, "❌ Error during graceful shutdown");
        clearTimeout(forceShutdownTimeout);
        process.exit(1);
    }
};
// ==========================================
// PROCESS SIGNAL & ERROR LISTENERS
// ==========================================
// Handle OS Termination Signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
// Handle Uncaught Exceptions & Unhandled Rejections
process.on("uncaughtException", (error) => {
    logger_1.logger.error({ err: error }, "💥 Uncaught Exception detected!");
    gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
    logger_1.logger.error({ reason }, "💥 Unhandled Promise Rejection detected!");
    gracefulShutdown("unhandledRejection");
});
