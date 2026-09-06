"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVisitZodSchema = exports.CheckInVisitZodSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// ==========================================
// 2. Zod Validation Schemas
// ==========================================
exports.CheckInVisitZodSchema = zod_1.z.object({
    patientId: zod_1.z.string().uuid(),
    attendingId: zod_1.z.string().uuid().optional(),
    visitType: zod_1.z.enum(["OPD", "IPD", "EMERGENCY", "REFERRAL"]),
    priority: zod_1.z.enum(["NORMAL", "URGENT", "CRITICAL"]),
    status: zod_1.z.nativeEnum(client_1.VisitStatus).optional().default(client_1.VisitStatus.NOT_STARTED),
    symptoms: zod_1.z.string().optional(),
    diagnosis: zod_1.z.string().optional(),
    icdCode: zod_1.z.string().optional(),
});
exports.UpdateVisitZodSchema = zod_1.z.object({
    diagnosis: zod_1.z.string().nullable().optional(),
    icdCode: zod_1.z.string().nullable().optional(),
    symptoms: zod_1.z.string().nullable().optional(),
    priority: zod_1.z
        .nativeEnum(client_1.VisitPriority, { message: "Invalid priority level" })
        .optional(),
    status: zod_1.z.nativeEnum(client_1.VisitStatus).optional(), // <-- Added status optional validation
    attendingId: zod_1.z
        .string()
        .uuid({ message: "Invalid attending staff ID format" })
        .optional(),
});
