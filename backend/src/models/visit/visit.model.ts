import { z } from "zod";
import { VisitPriority, VisitType } from "@prisma/client";

// ==========================================
// 1. TypeScript DTO Interfaces
// ==========================================

export interface CreateVisitDTO {
  patientId: string;
  attendingId: string;
  symptoms?: string | null;
  diagnosis?: string | null; // <-- Added | null
  icdCode?: string | null; // <-- Added | null
  visitType?: VisitType;
  priority?: VisitPriority;
}

export interface UpdateVisitDTO {
  diagnosis?: string | null; // <-- Added | null
  icdCode?: string | null; // <-- Added | null
  symptoms?: string | null; // <-- Added | null
  priority?: VisitPriority;
  attendingId?: string;
}

export interface VisitResponseDTO {
  success: boolean;
  message: string;
  data: {
    id: string;
    patientId: string;
    attendingId: string;
    diagnosis?: string | null;
    icdCode?: string | null;
    symptoms?: string | null;
    visitType: VisitType;
    priority: VisitPriority;
    createdAt: Date;
    attending?: {
      id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
}

// ==========================================
// 2. Zod Validation Schemas
// ==========================================

export const CheckInVisitZodSchema = z.object({
  patientId: z.string().uuid({ message: "Invalid patient ID format" }),
  attendingId: z
    .string()
    .uuid({ message: "Invalid attending staff ID format" }),
  diagnosis: z.string().nullable().optional(),
  icdCode: z.string().nullable().optional(),
  symptoms: z.string().nullable().optional(),
  visitType: z
    .nativeEnum(VisitType, { message: "Invalid visit type" })
    .optional(),
  priority: z
    .nativeEnum(VisitPriority, { message: "Invalid priority level" })
    .optional(),
});

export const UpdateVisitZodSchema = z.object({
  diagnosis: z.string().nullable().optional(),
  icdCode: z.string().nullable().optional(),
  symptoms: z.string().nullable().optional(),
  priority: z
    .nativeEnum(VisitPriority, { message: "Invalid priority level" })
    .optional(),
  attendingId: z
    .string()
    .uuid({ message: "Invalid attending staff ID format" })
    .optional(),
});

// Infer TypeScript types directly from Zod schemas for 1:1 synchronization
export type CheckInVisitInput = z.infer<typeof CheckInVisitZodSchema>;
export type UpdateVisitInput = z.infer<typeof UpdateVisitZodSchema>;
