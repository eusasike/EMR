import { z } from "zod";

// ==========================================
// 1. FACILITY DOMAIN DTOs
// ==========================================

export interface CreateFacilityDTO {
  code: string;
  name: string;
  type?: string;
  regionId?: string;
  districtId?: string;
  isActive?: boolean;
}

export interface UpdateFacilityDTO {
  code?: string;
  name?: string;
  type?: string;
  regionId?: string;
  districtId?: string;
  isActive?: boolean;
}

/**
 * Standard Facility entity projection matching Prisma return types.
 */
export interface FacilityDTO {
  id: string;
  code: string;
  name: string;
  type?: string | null;
  regionId?: string | null;
  districtId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// 2. HARDENED ZOD VALIDATION SCHEMAS
// ==========================================

export const CreateFacilityZodSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Facility code must be at least 2 characters")
    .max(20, "Facility code cannot exceed 20 characters")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, "Facility name must be at least 2 characters")
    .max(100, "Facility name cannot exceed 100 characters"),
  type: z.string().trim().max(50).optional(),
  regionId: z.string().uuid("Invalid Region ID format").optional(),
  districtId: z.string().uuid("Invalid District ID format").optional(),
  isActive: z.boolean().default(true),
});

export const UpdateFacilityZodSchema = CreateFacilityZodSchema.partial();

export const FacilitySearchQueryZodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name search query cannot be empty")
    .optional(),
  code: z
    .string()
    .trim()
    .min(1, "Code search query cannot be empty")
    .optional(),
});
