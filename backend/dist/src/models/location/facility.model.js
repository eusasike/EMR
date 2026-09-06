"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilitySearchQueryZodSchema = exports.UpdateFacilityZodSchema = exports.CreateFacilityZodSchema = void 0;
const zod_1 = require("zod");
// ==========================================
// 2. HARDENED ZOD VALIDATION SCHEMAS
// ==========================================
exports.CreateFacilityZodSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .trim()
        .min(2, "Facility code must be at least 2 characters")
        .max(20, "Facility code cannot exceed 20 characters")
        .transform((val) => val.toUpperCase()),
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Facility name must be at least 2 characters")
        .max(100, "Facility name cannot exceed 100 characters"),
    type: zod_1.z.string().trim().max(50).optional(),
    regionId: zod_1.z.string().uuid("Invalid Region ID format").optional(),
    districtId: zod_1.z.string().uuid("Invalid District ID format").optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.UpdateFacilityZodSchema = exports.CreateFacilityZodSchema.partial();
exports.FacilitySearchQueryZodSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, "Name search query cannot be empty")
        .optional(),
    code: zod_1.z
        .string()
        .trim()
        .min(1, "Code search query cannot be empty")
        .optional(),
});
