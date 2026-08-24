import { z } from "zod";

export enum PrescriptionStatus {
  PENDING = "PENDING",
  PARTIALLY_DISPENSED = "PARTIALLY_DISPENSED",
  DISPENSED = "DISPENSED",
  CANCELLED = "CANCELLED",
}

export interface CreatePrescriptionItemDTO {
  productId: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantityOrdered: number;
  route?: string;
  instructions?: string;
}

export interface CreatePrescriptionDTO {
  visitId: string;
  notes?: string;
  items: CreatePrescriptionItemDTO[];
}

export const createPrescriptionItemSchema = z.object({
  productId: z.string().uuid("Invalid Product ID"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z
    .string()
    .min(1, "Frequency is required (e.g., 'TID', '1x daily')"),
  durationDays: z.number().int().positive("Duration must be at least 1 day"),
  quantityOrdered: z
    .number()
    .int()
    .positive("Quantity ordered must be at least 1"),
  route: z.string().optional(),
  instructions: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  visitId: z.string().uuid("Invalid Visit ID"),
  notes: z.string().optional(),
  items: z
    .array(createPrescriptionItemSchema)
    .min(1, "Prescription must contain at least one item"),
});
