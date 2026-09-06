"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vitalSignsQuerySchema = exports.updateVitalSignsSchema = exports.createVitalSignsSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// 2. Zod Schemas for Runtime Validation
exports.createVitalSignsSchema = zod_1.z.object({
    visitId: zod_1.z.string().uuid("Invalid visit ID format"),
    temperature: zod_1.z
        .number()
        .min(30.0)
        .max(45.0, "Temperature out of valid range (°C)")
        .optional(),
    systolicBP: zod_1.z
        .number()
        .int()
        .min(40)
        .max(300, "Systolic BP out of valid range (mmHg)")
        .optional(),
    diastolicBP: zod_1.z
        .number()
        .int()
        .min(20)
        .max(200, "Diastolic BP out of valid range (mmHg)")
        .optional(),
    pulseRate: zod_1.z
        .number()
        .int()
        .min(20)
        .max(250, "Pulse rate out of valid range (bpm)")
        .optional(),
    respiratoryRate: zod_1.z
        .number()
        .int()
        .min(4)
        .max(80, "Respiratory rate out of valid range (bpm)")
        .optional(),
    spo2: zod_1.z
        .number()
        .int()
        .min(0)
        .max(100, "SpO2 must be between 0 and 100%")
        .optional(),
    weight: zod_1.z.number().positive().max(500, "Weight must be in kg"),
    height: zod_1.z.number().positive().max(300, "Height must be in cm").optional(),
    priority: zod_1.z.nativeEnum(client_1.TriagePriority).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.updateVitalSignsSchema = exports.createVitalSignsSchema
    .partial()
    .omit({ visitId: true });
exports.vitalSignsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    patientId: zod_1.z.string().uuid().optional(),
    priority: zod_1.z.nativeEnum(client_1.TriagePriority).optional(),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
});
