import { z } from "zod";
import { TriagePriority } from "@prisma/client";

// 1. Pure TypeScript Interfaces for TSOA & OpenAPI generation
export interface CreateVitalSignsInput {
  visitId: string;
  temperature?: number;
  systolicBP?: number;
  diastolicBP?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  weight: number;
  height?: number;
  priority?: TriagePriority;
  notes?: string;
}

// Derived using standard TS utility types (TSOA supports Partial and Omit)
export type UpdateVitalSignsInput = Partial<
  Omit<CreateVitalSignsInput, "visitId">
>;

export interface VitalSignsQueryInput {
  page?: number;
  limit?: number;
  patientId?: string;
  priority?: TriagePriority;
  startDate?: Date;
  endDate?: Date;
}

// 2. Zod Schemas for Runtime Validation
export const createVitalSignsSchema = z.object({
  visitId: z.string().uuid("Invalid visit ID format"),
  temperature: z
    .number()
    .min(30.0)
    .max(45.0, "Temperature out of valid range (°C)")
    .optional(),
  systolicBP: z
    .number()
    .int()
    .min(40)
    .max(300, "Systolic BP out of valid range (mmHg)")
    .optional(),
  diastolicBP: z
    .number()
    .int()
    .min(20)
    .max(200, "Diastolic BP out of valid range (mmHg)")
    .optional(),
  pulseRate: z
    .number()
    .int()
    .min(20)
    .max(250, "Pulse rate out of valid range (bpm)")
    .optional(),
  respiratoryRate: z
    .number()
    .int()
    .min(4)
    .max(80, "Respiratory rate out of valid range (bpm)")
    .optional(),
  spo2: z
    .number()
    .int()
    .min(0)
    .max(100, "SpO2 must be between 0 and 100%")
    .optional(),
  weight: z.number().positive().max(500, "Weight must be in kg"),
  height: z.number().positive().max(300, "Height must be in cm").optional(),
  priority: z.nativeEnum(TriagePriority).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateVitalSignsSchema = createVitalSignsSchema
  .partial()
  .omit({ visitId: true });

export const vitalSignsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  patientId: z.string().uuid().optional(),
  priority: z.nativeEnum(TriagePriority).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
