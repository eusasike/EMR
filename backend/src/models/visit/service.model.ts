import { z } from "zod";

// --- Medical Service Catalog Payload DTO ---
export interface MedicalServiceDTO {
  id: string;
  name: string;
  category: string;
  price: number;
  createdAt: Date;
}

export interface CreateMedicalServiceDTO {
  name: string;
  category: string;
  price: number;
}

export interface UpdateMedicalServiceDTO {
  name?: string;
  category?: string;
  price?: number;
}

// --- Provided Service Payload DTO ---
export interface ProvidedServiceDTO {
  id: string;
  visitId: string;
  serviceId: string;
  unitPrice: number;
  notes: string | null;
  service?: {
    name: string;
    category: string;
  };
}

export interface AddProvidedServiceDTO {
  visitId: string;
  serviceId: string;
  notes?: string;
}

// Zod Schemas
export const CreateMedicalServiceZodSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  category: z.string().min(2, "Category is required"),
  price: z.number().positive("Price must be greater than 0"),
});

export const UpdateMedicalServiceZodSchema =
  CreateMedicalServiceZodSchema.partial();

export const AddProvidedServiceZodSchema = z.object({
  visitId: z.string().uuid("Invalid visit ID format"),
  serviceId: z.string().uuid("Invalid service ID format"),
  notes: z.string().optional(),
});
