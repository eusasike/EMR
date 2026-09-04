import { z } from "zod";

// ==========================================
// 1. Pure TypeScript Interfaces for TSOA & OpenAPI
// ==========================================

export interface CreateMedicalServiceInput {
  facilityId: string;
  name: string;
  category: string;
  price: number;
  isActive?: boolean;
}

export type UpdateMedicalServiceInput = Partial<CreateMedicalServiceInput>;

export interface ProvideServiceInput {
  visitId: string;
  serviceId: string;
  providedById: string;
  notes?: string;
}

export interface MedicalServiceQueryInput {
  facilityId?: string;
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

// RabbitMQ Event Structures
export enum ServiceRoutingKey {
  CREATED = "service.created",
  UPDATED = "service.updated",
  PROVIDED = "service.provided",
}

export interface MedicalServiceCreatedEvent {
  serviceId: string;
  facilityId: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
  timestamp: string;
}

export interface ServiceProvidedEvent {
  providedServiceId: string;
  visitId: string;
  serviceId: string;
  providedById: string;
  unitPrice: number;
  timestamp: string;
}

export interface MedicalServiceUpdatedEvent {
  serviceId: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
  timestamp: string;
}

// ==========================================
// 2. Zod Schemas for Runtime Validation
// ==========================================

export const createMedicalServiceSchema = z.object({
  facilityId: z.string().uuid("Invalid facility ID format"),
  name: z
    .string()
    .min(1, "Service name is required")
    .max(100, "Service name cannot exceed 100 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category cannot exceed 50 characters"),
  price: z.number().positive("Price must be a positive number"),
  isActive: z.boolean().optional(),
});

export const updateMedicalServiceSchema = createMedicalServiceSchema.partial();

export const provideServiceSchema = z.object({
  visitId: z.string().uuid("Invalid visit ID format"),
  serviceId: z.string().uuid("Invalid service ID format"),
  providedById: z.string().uuid("Invalid providedBy ID format"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const medicalServiceQuerySchema = z.object({
  facilityId: z.string().uuid("Invalid facility ID format").optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  search: z.string().optional(),
});

export const medicalServiceCreatedEventSchema = z.object({
  serviceId: z.string(),
  facilityId: z.string(),
  name: z.string(),
  category: z.string(),
  price: z.number(),
  isActive: z.boolean(),
  timestamp: z.string(),
});

// ➕ Add these two missing schemas:
export const medicalServiceUpdatedEventSchema = z.object({
  serviceId: z.string(),
  name: z.string(),
  category: z.string(),
  price: z.number(),
  isActive: z.boolean(),
  timestamp: z.string(),
});

export const serviceProvidedEventSchema = z.object({
  providedServiceId: z.string(),
  visitId: z.string(),
  serviceId: z.string(),
  providedById: z.string(),
  unitPrice: z.number(),
  isActive: z.boolean().optional().default(true),
  timestamp: z.string(),
});

export interface CreatePrescriptionInput {
  visitId: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    dosage?: string;
    duration?: string;
  }[];
}

export const createPrescriptionSchema = z.object({
  visitId: z.string().uuid("Invalid visit ID format"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID format"),
        quantity: z.number().positive("Quantity must be a positive number"),
        unitPrice: z.number().nonnegative("Unit price cannot be negative"),
        dosage: z.string().optional(),
        duration: z.string().optional(),
      }),
    )
    .min(1, "At least one prescription item is required"),
});
