"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const tsoa_1 = require("tsoa");
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
let HealthController = class HealthController extends tsoa_1.Controller {
    /**
     * Check system health (PostgreSQL and Redis connectivity)
     */
    async checkHealth() {
        // Run checks in parallel for maximum speed
        const [postgresStatus, redisStatus] = await Promise.all([
            this.checkPostgres(),
            this.checkRedis(),
        ]);
        const allUp = postgresStatus.status === "UP" && redisStatus.status === "UP";
        const oneUp = postgresStatus.status === "UP" || redisStatus.status === "UP";
        const overallStatus = allUp
            ? "UP"
            : oneUp
                ? "DEGRADED"
                : "DOWN";
        // Set HTTP status code based on health state
        if (!allUp) {
            this.setStatus(503);
        }
        else {
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
    async checkPostgres() {
        const startTime = Date.now();
        try {
            await database_1.prisma.$queryRaw `SELECT 1`;
            return {
                status: "UP",
                latencyMs: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                status: "DOWN",
                error: error.message || "PostgreSQL ping failed",
            };
        }
    }
    /**
     * Ping Redis via ioredis client
     */
    async checkRedis() {
        const startTime = Date.now();
        try {
            const pingResponse = await redis_1.redisClient.ping();
            if (pingResponse === "PONG") {
                return {
                    status: "UP",
                    latencyMs: Date.now() - startTime,
                };
            }
            throw new Error(`Unexpected Redis ping response: ${pingResponse}`);
        }
        catch (error) {
            return {
                status: "DOWN",
                error: error.message || "Redis ping failed",
            };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, tsoa_1.SuccessResponse)("200", "All services are operational"),
    (0, tsoa_1.Response)("503", "One or more services are down"),
    (0, tsoa_1.Get)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "checkHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, tsoa_1.Tags)("Health"),
    (0, tsoa_1.Route)("api/v1/health")
], HealthController);
