"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDistrictZodSchema = exports.CreateDistrictZodSchema = exports.UpdateRegionZodSchema = exports.CreateRegionZodSchema = void 0;
const zod_1 = require("zod");
// Zod Validation Schemas
exports.CreateRegionZodSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .trim()
        .min(2, "Region code must be at least 2 characters")
        .max(10, "Region code cannot exceed 10 characters")
        .transform((val) => val.toUpperCase()),
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Region name must be at least 2 characters")
        .max(100, "Region name cannot exceed 100 characters"),
});
exports.UpdateRegionZodSchema = exports.CreateRegionZodSchema.partial();
exports.CreateDistrictZodSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .trim()
        .min(2, "District code must be at least 2 characters")
        .max(15, "District code cannot exceed 15 characters")
        .transform((val) => val.toUpperCase()),
    name: zod_1.z
        .string()
        .trim()
        .min(2, "District name must be at least 2 characters")
        .max(100, "District name cannot exceed 100 characters"),
});
exports.UpdateDistrictZodSchema = exports.CreateDistrictZodSchema.partial();
