import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database";
import { redisClient } from "../../config/redis";
import { publishToQueue } from "../../config/rabbitmq";
import { UnauthorizedError } from "../../util/custom-error";
import {
  LoginDTO,
  LoginResponseDTO,
  RefreshTokenResponseDTO,
  RefreshTokenDTO,
  LogoutDTO,
} from "../../models/User/auth.model";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "superrefreshsecret";

export class AuthService {
  async login(input: LoginDTO): Promise<LoginResponseDTO["data"]> {
    // 1. Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    // 2. Validate user existence and status
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // 4. Generate JWT Tokens
    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15m", // Short-lived access token
    });

    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d", // Long-lived refresh token
    });

    // 5. Store Refresh Token in Redis (7 Days TTL)
    const redisKey = `refresh_token:${user.id}`;
    const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

    try {
      await redisClient.set(
        redisKey,
        refreshToken,
        "EX",
        SEVEN_DAYS_IN_SECONDS,
      );
    } catch (cacheError) {
      console.warn("⚠️ Failed to store refresh token in Redis:", cacheError);
    }

    // 6. Emit audit event to RabbitMQ
    try {
      await publishToQueue("auth_events", "USER_LOGGED_IN", {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
    } catch (queueError) {
      console.warn("⚠️ Failed to publish login event to RabbitMQ:", queueError);
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh token rotation
  async refreshToken(
    input: RefreshTokenDTO,
  ): Promise<RefreshTokenResponseDTO["data"]> {
    const { refreshToken } = input;

    // 1. Verify JWT signature & expiration
    let decoded: { id: string };
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const redisKey = `refresh_token:${decoded.id}`;

    // 2. Fetch stored refresh token from Redis
    const storedToken = await redisClient.get(redisKey);

    // 3. Reuse / Compromise Detection:
    // If no token exists or provided token doesn't match stored token, invalidate session
    if (!storedToken || storedToken !== refreshToken) {
      if (storedToken) {
        // Token was likely stolen & reused elsewhere -> force revoke
        await redisClient.del(redisKey);
      }
      throw new UnauthorizedError(
        "Refresh token has been revoked or superseded",
      );
    }

    // 4. Ensure user still exists and account is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      await redisClient.del(redisKey);
      throw new UnauthorizedError("User account no longer exists");
    }

    // 5. Generate New Token Pair (Refresh Token Rotation)
    const payload = { id: user.id, email: user.email, role: user.role };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // 6. Overwrite old token in Redis with new Refresh Token (7 Days TTL)
    const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
    await redisClient.set(
      redisKey,
      newRefreshToken,
      "EX",
      SEVEN_DAYS_IN_SECONDS,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Logout
  async logout(input: LogoutDTO): Promise<void> {
    const { refreshToken } = input;

    try {
      // Decode payload to extract user ID (using decode so expired tokens won't throw)
      const decoded = jwt.decode(refreshToken) as { id?: string } | null;

      if (decoded?.id) {
        const redisKey = `refresh_token:${decoded.id}`;
        await redisClient.del(redisKey);
      }
    } catch (error: any) {
      console.warn(
        "⚠️ Failed to delete refresh token during logout:",
        error.message,
      );
    }
  }
}
