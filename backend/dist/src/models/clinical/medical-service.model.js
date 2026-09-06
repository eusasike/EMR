"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrescriptionSchema = exports.serviceProvidedEventSchema = exports.medicalServiceUpdatedEventSchema = exports.medicalServiceCreatedEventSchema = exports.medicalServiceQuerySchema = exports.provideServiceSchema = exports.updateMedicalServiceSchema = exports.createMedicalServiceSchema = exports.ServiceRoutingKey = void 0;
const zod_1 = require("zod");
// RabbitMQ Event Structures
var ServiceRoutingKey;
(function (ServiceRoutingKey) {
    ServiceRoutingKey["CREATED"] = "service.created";
    ServiceRoutingKey["UPDATED"] = "service.updated";
    ServiceRoutingKey["PROVIDED"] = "service.provided";
})(ServiceRoutingKey || (exports.ServiceRoutingKey = ServiceRoutingKey = {}));
// ==========================================
// 2. Zod Schemas for Runtime Validation
// ==========================================
exports.createMedicalServiceSchema = zod_1.z.object({
    facilityId: zod_1.z.string().uuid("Invalid facility ID format"),
    name: zod_1.z
        .string()
        .min(1, "Service name is required")
        .max(100, "Service name cannot exceed 100 characters"),
    category: zod_1.z
        .string()
        .min(1, "Category is required")
        .max(50, "Category cannot exceed 50 characters"),
    price: zod_1.z.number().positive("Price must be a positive number"),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateMedicalServiceSchema = exports.createMedicalServiceSchema.partial();
exports.provideServiceSchema = zod_1.z.object({
    visitId: zod_1.z.string().uuid("Invalid visit ID format"),
    serviceId: zod_1.z.string().uuid("Invalid service ID format"),
    providedById: zod_1.z.string().uuid("Invalid providedBy ID format"),
    notes: zod_1.z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});
exports.medicalServiceQuerySchema = zod_1.z.object({
    facilityId: zod_1.z.string().uuid("Invalid facility ID format").optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    category: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
exports.medicalServiceCreatedEventSchema = zod_1.z.object({
    serviceId: zod_1.z.string(),
    facilityId: zod_1.z.string(),
    name: zod_1.z.string(),
    category: zod_1.z.string(),
    price: zod_1.z.number(),
    isActive: zod_1.z.boolean(),
    timestamp: zod_1.z.string(),
});
// ➕ Add these two missing schemas:
exports.medicalServiceUpdatedEventSchema = zod_1.z.object({
    serviceId: zod_1.z.string(),
    name: zod_1.z.string(),
    category: zod_1.z.string(),
    price: zod_1.z.number(),
    isActive: zod_1.z.boolean(),
    timestamp: zod_1.z.string(),
});
exports.serviceProvidedEventSchema = zod_1.z.object({
    providedServiceId: zod_1.z.string(),
    visitId: zod_1.z.string(),
    serviceId: zod_1.z.string(),
    providedById: zod_1.z.string(),
    unitPrice: zod_1.z.number(),
    isActive: zod_1.z.boolean().optional().default(true),
    timestamp: zod_1.z.string(),
});
exports.createPrescriptionSchema = zod_1.z.object({
    visitId: zod_1.z.string().uuid("Invalid visit ID format"),
    notes: zod_1.z.string().max(500, "Notes cannot exceed 500 characters").optional(),
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().uuid("Invalid product ID format"),
        quantity: zod_1.z.number().positive("Quantity must be a positive number"),
        unitPrice: zod_1.z.number().nonnegative("Unit price cannot be negative"),
        dosage: zod_1.z.string().optional(),
        duration: zod_1.z.string().optional(),
    }))
        .min(1, "At least one prescription item is required"),
});
