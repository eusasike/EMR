import { z } from "zod";

// ==========================================
// 1. Pure TypeScript Interfaces for TSOA & OpenAPI generation
// ==========================================

export interface CreateMedicalServiceInput {
  name: string;
  category: string;
  price: number;
}

export type UpdateMedicalServiceInput = Partial<CreateMedicalServiceInput>;

export interface ProvideServiceInput {
  visitId: string;
  serviceId: string;
  providedById: string;
  notes?: string;
}

export interface MedicalServiceQueryInput {
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
  name: string;
  category: string;
  price: number;
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
  timestamp: string;
}

// ==========================================
// 2. Zod Schemas for Runtime Validation
// ==========================================

export const createMedicalServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required")
    .max(100, "Service name cannot exceed 100 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category cannot exceed 50 characters"),
  price: z.number().positive("Price must be a positive number"),
});

export const updateMedicalServiceSchema = createMedicalServiceSchema.partial();

export const provideServiceSchema = z.object({
  visitId: z.string().uuid("Invalid visit ID format"),
  serviceId: z.string().uuid("Invalid service ID format"),
  providedById: z.string().uuid("Invalid providedBy ID format"), // <-- Added validation
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const medicalServiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  search: z.string().optional(),
});

// Event Validation Schemas
export const medicalServiceCreatedEventSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID format"),
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  timestamp: z.string().datetime("Invalid ISO timestamp format"),
});

export const serviceProvidedEventSchema = z.object({
  providedServiceId: z.string().uuid("Invalid provided service ID format"),
  visitId: z.string().uuid("Invalid visit ID format"),
  serviceId: z.string().uuid("Invalid service ID format"),
  providedById: z.string().uuid("Invalid providedBy ID format"), // <-- Added validation
  unitPrice: z.number().positive(),
  timestamp: z.string().datetime("Invalid ISO timestamp format"),
});

export const medicalServiceUpdatedEventSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID format"),
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  timestamp: z.string().datetime("Invalid ISO timestamp format"),
});
