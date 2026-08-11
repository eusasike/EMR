import { app } from "./app";
import { prisma } from "./config/database";
import { redis } from "./config/redis";
import { rabbitmq } from "./config/rabitmq";

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

/**
 * Graceful Shutdown Handler
 */
const shutdown = async (signal: string) => {
  console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);

  // 1. Stop accepting new HTTP requests
  server.close(async () => {
    console.log("HTTP server closed.");

    try {
      // 2. Close RabbitMQ Connection (Finish current tasks first)
      console.log("Closing RabbitMQ connection...");
      await rabbitmq.close();

      // 3. Close Redis
      console.log("Closing Redis connection...");
      await redis.quit();

      // 4. Close Prisma Database Connection
      console.log("Closing Prisma connection...");
      await prisma.$disconnect();

      console.log("Shutdown complete. Goodbye.");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error("Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
