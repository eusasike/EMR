import { Request } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  facilityIds?: string[]; // 👈 Accessible facility IDs in token payload
}

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[],
): Promise<JwtPayload> {
  if (securityName === "jwt") {
    let token: string | undefined = request.cookies?.accessToken;

    if (!token && request.headers.authorization) {
      const parts = request.headers.authorization.split(" ");
      if (parts[0] === "Bearer" && parts[1]) {
        token = parts[1];
      }
    }

    if (!token) {
      throw new Error("Missing authentication token");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecret",
      ) as JwtPayload;

      if (scopes && scopes.length > 0) {
        if (!scopes.includes(decoded.role)) {
          throw new Error("Insufficient permissions to access this resource");
        }
      }

      return decoded;
    } catch (err: any) {
      throw new Error(err.message || "Unauthorized");
    }
  }

  throw new Error("Unknown security scheme");
}
