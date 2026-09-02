import { z } from "zod";
import { Role } from "@prisma/client";
import { is } from "zod/locales";

const phoneRegex = /^\+?[1-9]\d{8,14}$/;

// TypeScript DTO used by TSOA for Swagger generation
export interface RegisterUserDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
  facilityId?: string;
  isActive?: boolean;
}

// Zod Schema used inside the controller for runtime validation
export const RegisterUserZodSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  middleName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(Role, {
    message: "Invalid staff role specified",
  }),
  facilityId: z.string().optional(),
});
