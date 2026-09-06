"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProvidedServiceZodSchema = exports.UpdateMedicalServiceZodSchema = exports.CreateMedicalServiceZodSchema = void 0;
const zod_1 = require("zod");
// Zod Schemas
exports.CreateMedicalServiceZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Service name is required"),
    category: zod_1.z.string().min(2, "Category is required"),
    price: zod_1.z.number().positive("Price must be greater than 0"),
});
exports.UpdateMedicalServiceZodSchema = exports.CreateMedicalServiceZodSchema.partial();
exports.AddProvidedServiceZodSchema = zod_1.z.object({
    visitId: zod_1.z.string().uuid("Invalid visit ID format"),
    serviceId: zod_1.z.string().uuid("Invalid service ID format"),
    notes: zod_1.z.string().optional(),
});
