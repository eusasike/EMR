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
    // 1. Fetch user along with explicit FacilityUser relations
    const user = await prisma.user.findUnique({
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
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account has been deactivated");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
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

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // 4. Store Refresh Token in Redis
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

    // 5. Emit audit event to RabbitMQ
    try {
      await publishToQueue("auth_events", "USER_LOGGED_IN", {
        userId: user.id,
        email: user.email,
        facilityIds,
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
        facilities: userFacilities,
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

    let decoded: { id: string };
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const redisKey = `refresh_token:${decoded.id}`;
    const storedToken = await redisClient.get(redisKey);

    if (!storedToken || storedToken !== refreshToken) {
      if (storedToken) {
        await redisClient.del(redisKey);
      }
      throw new UnauthorizedError(
        "Refresh token has been revoked or superseded",
      );
    }

    // Fetch user with linked facilities
    const user = await prisma.user.findUnique({
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
      await redisClient.del(redisKey);
      throw new UnauthorizedError("User account no longer active");
    }

    const facilityIds = user.facilities.map((f) => f.facilityId);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      facilityIds,
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

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
