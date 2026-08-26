import { z } from "zod";
import { VisitPriority, VisitStatus, VisitType } from "@prisma/client";

// ==========================================
// 1. TypeScript DTO Interfaces
// ==========================================

export interface CreateVisitDTO {
  facilityId: string; // Populated via req.user.facilityId
  attendingId: string; // Populated via req.user.id
  patientId: string;
  symptoms?: string | null;
  diagnosis?: string | null;
  icdCode?: string | null;
  visitType?: VisitType;
  priority?: VisitPriority;
  status?: VisitStatus;
}

export interface UpdateVisitDTO {
  diagnosis?: string | null;
  icdCode?: string | null;
  symptoms?: string | null;
  priority?: VisitPriority;
  status?: VisitStatus;
  attendingId?: string;
}

export interface VisitDataPayload {
  id: string;
  patientId: string;
  attendingId: string;
  facilityId: string;
  visitType: VisitType;
  priority: VisitPriority;
  status: VisitStatus;
  symptoms?: string | null;
  diagnosis?: string | null;
  icdCode?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// backend/src/models/visit/visit.model.ts

export interface BaseResponseDTO {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface VisitResponseDTO extends BaseResponseDTO {
  data?: VisitDataPayload;
}

export interface ErrorResponseDTO extends BaseResponseDTO {
  errors?: Record<string, string[]>;
}

// ==========================================
// 2. Zod Validation Schemas
// ==========================================

export const CheckInVisitZodSchema = z.object({
  patientId: z.string().uuid(),
  attendingId: z.string().uuid().optional(),
  visitType: z.enum(["OPD", "IPD", "EMERGENCY", "REFERRAL"]),
  priority: z.enum(["NORMAL", "URGENT", "CRITICAL"]),
  status: z.nativeEnum(VisitStatus).optional().default(VisitStatus.NOT_STARTED),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  icdCode: z.string().optional(),
});

export const UpdateVisitZodSchema = z.object({
  diagnosis: z.string().nullable().optional(),
  icdCode: z.string().nullable().optional(),
  symptoms: z.string().nullable().optional(),
  priority: z
    .nativeEnum(VisitPriority, { message: "Invalid priority level" })
    .optional(),
  status: z.nativeEnum(VisitStatus).optional(), // <-- Added status optional validation
  attendingId: z
    .string()
    .uuid({ message: "Invalid attending staff ID format" })
    .optional(),
});

export type CheckInVisitInput = z.infer<typeof CheckInVisitZodSchema>;
export type UpdateVisitInput = z.infer<typeof UpdateVisitZodSchema>;
