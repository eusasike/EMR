import { z } from "zod";

// DTOs
export interface CreateRegionDTO {
  code: string; // e.g. "TZ-01"
  name: string; // e.g. "Dodoma"
}

export interface UpdateRegionDTO {
  code?: string;
  name?: string;
}

export interface CreateDistrictDTO {
  code: string; // e.g., "TZ-01-01" or "DOD-URBAN"
  name: string;
}
export interface UpdateDistrictDTO {
  name?: string;
}

// Zod Validation Schemas
export const CreateRegionZodSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Region code must be at least 2 characters")
    .max(10, "Region code cannot exceed 10 characters")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, "Region name must be at least 2 characters")
    .max(100, "Region name cannot exceed 100 characters"),
});

export const UpdateRegionZodSchema = CreateRegionZodSchema.partial();

export const CreateDistrictZodSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "District code must be at least 2 characters")
    .max(15, "District code cannot exceed 15 characters")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, "District name must be at least 2 characters")
    .max(100, "District name cannot exceed 100 characters"),
});
export const UpdateDistrictZodSchema = CreateDistrictZodSchema.partial();
