// models/pharmacy/pharmacy.model.ts
import { z } from "zod";

// ==========================================
// Enum Schemas
// ==========================================
export const ProductCategoryEnum = z.enum([
  "PILLS",
  "SYRINGES",
  "CAPSULE",
  "SYRUP",
]);

// ==========================================
// Product Interfaces (TSOA Compatible)
// ==========================================
export interface CreateProductDTO {
  code?: string;
  name: string;
  description?: string;
  category?: "PILLS" | "SYRINGES" | "CAPSULE" | "SYRUP";
  unitPrice: number;
  reorderLevel?: number;
}

export type UpdateProductDTO = Partial<CreateProductDTO>;

export const createProductSchema = z.object({
  code: z.string().trim().optional(),
  name: z.string().min(1, "Product name is required").trim(),
  description: z.string().optional(),
  category: ProductCategoryEnum.default("PILLS"),
  unitPrice: z.number().positive("Unit price must be greater than zero"),
  reorderLevel: z.number().int().nonnegative().default(10),
});

export const updateProductSchema = createProductSchema.partial();

// ==========================================
// ProductBatch Interfaces (TSOA Compatible)
// ==========================================
export interface CreateBatchDTO {
  productId: string;
  batchNumber: string;
  quantity: number;
  costPrice?: number;
  expiryDate: string;
}

export const createBatchSchema = z.object({
  productId: z.string().uuid("Invalid Product ID"),
  batchNumber: z.string().min(1, "Batch number is required").trim(),
  quantity: z
    .number()
    .int()
    .positive("Initial quantity must be greater than zero"),
  costPrice: z.number().positive("Cost price must be positive").optional(),
  expiryDate: z
    .string()
    .datetime({ message: "Expiry date must be a valid ISO string" }),
});

// ==========================================
// Dispense Interfaces (TSOA Compatible)
// ==========================================
export interface DispenseItemInputDTO {
  productId: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateDispenseRecordDTO {
  visitId?: string;
  dispensedById?: string;
  prescriptionId?: string;
  notes?: string;
  items: DispenseItemInputDTO[];
}

export const dispenseItemInputSchema = z.object({
  productId: z.string().uuid("Invalid Product ID"),
  batchId: z.string().uuid("Invalid Batch ID"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.number().positive("Unit price must be positive"),
});

export const createDispenseRecordSchema = z.object({
  visitId: z.string().uuid("Invalid Visit ID").optional(),
  dispensedById: z.string().uuid("Invalid DispensedBy User ID").optional(),
  prescriptionId: z.string().uuid("Invalid Prescription ID").optional(),
  notes: z.string().optional(),
  items: z
    .array(dispenseItemInputSchema)
    .min(1, "At least one item must be dispensed"),
});

// ==========================================
// Event Schemas & Routing Keys
// ==========================================
export interface ProductDispensedEvent {
  dispenseRecordId: string;
  visitId?: string | null;
  dispensedById: string;
  totalCost: number;
  itemCount: number;
  timestamp: string;
}

export interface ReorderLevelReachedEvent {
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  timestamp: string;
}

export const productDispensedEventSchema = z.object({
  dispenseRecordId: z.string().uuid(),
  visitId: z.string().uuid().nullable().optional(),
  dispensedById: z.string().uuid(),
  totalCost: z.number(),
  itemCount: z.number(),
  timestamp: z.string().datetime(),
});

export const reorderLevelReachedEventSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  currentStock: z.number().int(),
  reorderLevel: z.number().int(),
  timestamp: z.string().datetime(),
});

export enum PharmacyRoutingKey {
  DISPENSED = "pharmacy.product.dispensed",
  REORDER_LEVEL_REACHED = "pharmacy.product.reorder_level_reached",
}
