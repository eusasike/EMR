import { Controller, Get, Route, Tags, SuccessResponse, Response } from "tsoa";
import { prisma } from "../config/database";
import { redis } from "../config/redis";
import { rabbitmq } from "../config/rabitmq";

export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  dependencies: {
    database: boolean;
    redis: boolean;
    rabbitmq: boolean;
  };
}

@Tags("Health")
@Route("health")
export class HealthController extends Controller {
  /**
   * Check system health and verification status of connected services.
   */
  @Get("")
  @SuccessResponse(200, "System Healthy")
  @Response<HealthResponse>(503, "Service Unavailable")
  public async getHealth(): Promise<HealthResponse> {
    const healthStatus: HealthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      dependencies: {
        database: false,
        redis: false,
        rabbitmq: false,
      },
    };

    try {
      // 1. Check PostgreSQL via Prisma
      await prisma.$queryRaw`SELECT 1`;
      healthStatus.dependencies.database = true;

      // 2. Check Redis
      await redis.ping();
      healthStatus.dependencies.redis = true;

      // 3. Check RabbitMQ
      const channel = await rabbitmq.getChannel();
      healthStatus.dependencies.rabbitmq = !!channel;

      this.setStatus(200);
      return healthStatus;
    } catch (error) {
      healthStatus.status = "error";
      this.setStatus(503);
      return healthStatus;
    }
  }
}
