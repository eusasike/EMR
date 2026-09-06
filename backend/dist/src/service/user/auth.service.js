"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const rabbitmq_1 = require("../../config/rabbitmq");
const custom_error_1 = require("../../util/custom-error");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "superrefreshsecret";
class AuthService {
    async login(input) {
        // 1. Fetch user along with explicit FacilityUser relations
        const user = await database_1.prisma.user.findUnique({
            where: { email: input.email },
            include: {
                facilities: {
                    select: {
                        facility: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new custom_error_1.UnauthorizedError("Invalid email or password");
        }
        if (!user.isActive) {
            throw new custom_error_1.UnauthorizedError("Account has been deactivated");
        }
        const isPasswordValid = await bcrypt_1.default.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new custom_error_1.UnauthorizedError("Invalid email or password");
        }
        // 2. Map facility details
        const userFacilities = user.facilities.map((f) => ({
            id: f.facility.id,
            code: f.facility.code,
            name: f.facility.name,
        }));
        const facilityIds = userFacilities.map((f) => f.id);
        // 3. Generate JWT Tokens with facility context
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            facilityIds, // 👈 Embedded facility IDs for authorization checks
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: "15m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });
        // 4. Store Refresh Token in Redis
        const redisKey = `refresh_token:${user.id}`;
        const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
        try {
            await redis_1.redisClient.set(redisKey, refreshToken, "EX", SEVEN_DAYS_IN_SECONDS);
        }
        catch (cacheError) {
            console.warn("⚠️ Failed to store refresh token in Redis:", cacheError);
        }
        // 5. Emit audit event to RabbitMQ
        try {
            await (0, rabbitmq_1.publishToQueue)("auth_events", "USER_LOGGED_IN", {
                userId: user.id,
                email: user.email,
                facilityIds,
                timestamp: new Date().toISOString(),
            });
        }
        catch (queueError) {
            console.warn("⚠️ Failed to publish login event to RabbitMQ:", queueError);
        }
        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                facilities: userFacilities,
            },
            accessToken,
            refreshToken,
        };
    }
    // Refresh token rotation
    async refreshToken(input) {
        const { refreshToken } = input;
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
        }
        catch (error) {
            throw new custom_error_1.UnauthorizedError("Invalid refresh token");
        }
        const redisKey = `refresh_token:${decoded.id}`;
        const storedToken = await redis_1.redisClient.get(redisKey);
        if (!storedToken || storedToken !== refreshToken) {
            if (storedToken) {
                await redis_1.redisClient.del(redisKey);
            }
            throw new custom_error_1.UnauthorizedError("Refresh token has been revoked or superseded");
        }
        // Fetch user with linked facilities
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                facilities: {
                    select: {
                        facilityId: true,
                    },
                },
            },
        });
        if (!user || !user.isActive) {
            await redis_1.redisClient.del(redisKey);
            throw new custom_error_1.UnauthorizedError("User account no longer active");
        }
        const facilityIds = user.facilities.map((f) => f.facilityId);
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            facilityIds,
        };
        const newAccessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: "15m",
        });
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: user.id }, JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });
        const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
        await redis_1.redisClient.set(redisKey, newRefreshToken, "EX", SEVEN_DAYS_IN_SECONDS);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    // Logout
    async logout(input) {
        const { refreshToken } = input;
        try {
            const decoded = jsonwebtoken_1.default.decode(refreshToken);
            if (decoded?.id) {
                const redisKey = `refresh_token:${decoded.id}`;
                await redis_1.redisClient.del(redisKey);
            }
        }
        catch (error) {
            console.warn("⚠️ Failed to delete refresh token during logout:", error.message);
        }
    }
}
exports.AuthService = AuthService;
