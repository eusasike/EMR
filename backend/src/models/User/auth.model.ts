import { z } from "zod";

// DTO for TSOA Swagger Generation
export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface LoginResponseDTO {
  success: boolean;
  message: string;
  data: {
    user: AuthUserData;
    accessToken: string;
    refreshToken: string;
  };
}

// Zod Schema for runtime validation
export const LoginZodSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// DTO for Refresh Request
export interface RefreshTokenDTO {
  refreshToken: string;
}

// DTO for Refresh Response
export interface RefreshTokenResponseDTO {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

// Zod Runtime Validation
export const RefreshTokenZodSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// DTO for Logout Request
export interface LogoutDTO {
  refreshToken: string;
}

// DTO for Logout Response
export interface LogoutResponseDTO {
  success: boolean;
  message: string;
}

// Zod Runtime Validation
export const LogoutZodSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
