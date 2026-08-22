import { Request } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[],
): Promise<JwtPayload> {
  if (securityName === "jwt") {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecret",
      ) as JwtPayload;

      // Scope checking (e.g. checking if user has ADMIN role)
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
