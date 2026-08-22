import http from "http";
import { app } from "./app";
import { logger } from "./config/logger";
import { redisClient } from "./config/redis";
import { prisma } from "./config/database";

const PORT = Number(process.env.PORT) || 3000;

// Create HTTP Server
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} [http://localhost:${PORT}]`);
  logger.info(`📚 Swagger docs available at [http://localhost:${PORT}/docs]`);
});

let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(
    `🛑 [${signal}] Received shutdown signal. Initiating graceful shutdown...`,
  );

  // Force shutdown if cleanup takes longer than 10 seconds
  const forceShutdownTimeout = setTimeout(() => {
    logger.error("❌ Shutdown timed out! Forcing process exit.");
    process.exit(1);
  }, 10000);

  try {
    // Step 1: Stop HTTP Server from taking new requests
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        logger.info(
          "🔒 [HTTP Server] Closed successfully. No longer accepting requests.",
        );
        resolve();
      });
    });

    // Step 2: Gracefully disconnect Redis
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await redisClient.quit();
      logger.info("🔒 [Redis] Disconnected gracefully.");
    }

    // Step 3: Disconnect Prisma Database Connection
    await prisma.$disconnect();
    logger.info("🔒 [Prisma] Database connection closed.");

    clearTimeout(forceShutdownTimeout);
    logger.info("✅ Graceful shutdown completed cleanly. Exiting process.");
    process.exit(0);
  } catch (error: any) {
    logger.error({ err: error }, "❌ Error during graceful shutdown");
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
process.on("uncaughtException", (error: Error) => {
  logger.error({ err: error }, "💥 Uncaught Exception detected!");
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason: any) => {
  logger.error({ reason }, "💥 Unhandled Promise Rejection detected!");
  gracefulShutdown("unhandledRejection");
});
