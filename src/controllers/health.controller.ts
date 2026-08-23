import { Controller, Get, Route, Response, SuccessResponse, Tags } from "tsoa";
import { prisma } from "../config/database";
import { redisClient } from "../config/redis";

export interface ComponentStatus {
  status: "UP" | "DOWN";
  latencyMs?: number;
  error?: string;
}

export interface HealthResponseDTO {
  status: "UP" | "DOWN" | "DEGRADED";
  timestamp: string;
  uptimeSeconds: number;
  services: {
    postgres: ComponentStatus;
    redis: ComponentStatus;
  };
}

@Tags("Health")
@Route("api/v1/health")
export class HealthController extends Controller {
  /**
   * Check system health (PostgreSQL and Redis connectivity)
   */
  @SuccessResponse("200", "All services are operational")
  @Response<HealthResponseDTO>("503", "One or more services are down")
  @Get("/")
  public async checkHealth(): Promise<HealthResponseDTO> {
    // Run checks in parallel for maximum speed
    const [postgresStatus, redisStatus] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ]);

    const allUp = postgresStatus.status === "UP" && redisStatus.status === "UP";
    const oneUp = postgresStatus.status === "UP" || redisStatus.status === "UP";

    const overallStatus: "UP" | "DOWN" | "DEGRADED" = allUp
      ? "UP"
      : oneUp
        ? "DEGRADED"
        : "DOWN";

    // Set HTTP status code based on health state
    if (!allUp) {
      this.setStatus(503);
    } else {
      this.setStatus(200);
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        postgres: postgresStatus,
        redis: redisStatus,
      },
    };
  }

  /**
   * Ping PostgreSQL via Prisma raw query
   */
  private async checkPostgres(): Promise<ComponentStatus> {
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: "UP",
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        status: "DOWN",
        error: error.message || "PostgreSQL ping failed",
      };
    }
  }

  /**
   * Ping Redis via ioredis client
   */
  private async checkRedis(): Promise<ComponentStatus> {
    const startTime = Date.now();
    try {
      const pingResponse = await redisClient.ping();
      if (pingResponse === "PONG") {
        return {
          status: "UP",
          latencyMs: Date.now() - startTime,
        };
      }
      throw new Error(`Unexpected Redis ping response: ${pingResponse}`);
    } catch (error: any) {
      return {
        status: "DOWN",
        error: error.message || "Redis ping failed",
      };
    }
  }
}
