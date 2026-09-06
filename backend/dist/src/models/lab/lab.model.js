"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLabResultSchema = exports.orderLabServiceSchema = exports.recordLabResultSchema = void 0;
// src/dtos/lab-result.dto.ts
const zod_1 = require("zod");
const client_1 = require("@prisma/client"); // Use Prisma's generated enum
// Zod Validation Schemas
exports.recordLabResultSchema = zod_1.z.object({
    resultValue: zod_1.z.string().optional(),
    unit: zod_1.z.string().optional(),
    referenceRange: zod_1.z.string().optional(),
    findings: zod_1.z.string().optional(),
    specimenType: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.LabStatus).optional().default(client_1.LabStatus.COMPLETED),
});
exports.orderLabServiceSchema = zod_1.z.object({
    providedServiceId: zod_1.z.string().uuid("Invalid Provided Service ID"),
    visitId: zod_1.z.string().uuid("Invalid Visit ID"),
    specimenType: zod_1.z.string().optional(),
});
// Add this to src/models/lab/lab.model.ts
exports.verifyLabResultSchema = zod_1.z.object({
    findings: zod_1.z.string().optional(),
});
