// src/dtos/lab-result.dto.ts
import { z } from "zod";
import { LabStatus } from "@prisma/client"; // Use Prisma's generated enum

export interface OrderLabServiceDTO {
  providedServiceId: string;
  visitId: string;
  specimenType?: string;
}

export interface RecordLabResultDTO {
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  findings?: string;
  specimenType?: string;
  status?: LabStatus;
}

// Zod Validation Schemas
export const recordLabResultSchema = z.object({
  resultValue: z.string().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  findings: z.string().optional(),
  specimenType: z.string().optional(),
  status: z.nativeEnum(LabStatus).optional().default(LabStatus.COMPLETED),
});

export const orderLabServiceSchema = z.object({
  providedServiceId: z.string().uuid("Invalid Provided Service ID"),
  visitId: z.string().uuid("Invalid Visit ID"),
  specimenType: z.string().optional(),
});

// Add this to src/models/lab/lab.model.ts
export const verifyLabResultSchema = z.object({
  findings: z.string().optional(),
});
