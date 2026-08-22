// models/pharmacy/pharmacy.model.ts
import { z } from "zod";

// ==========================================
// Enum Schemas
// ==========================================
export const ProductCategoryEnum = z.enum([
  "MEDICINE",
  "EQUIPMENT",
  "CONSUMABLE",
  "SUPPLEMENT",
]);

// ==========================================
// Product Schemas
// ==========================================
export const createProductSchema = z.object({
  code: z.string().trim().optional(),
  name: z.string().min(1, "Product name is required").trim(),
  description: z.string().optional(),
  category: ProductCategoryEnum.default("MEDICINE"),
  unitPrice: z.number().positive("Unit price must be greater than zero"),
  reorderLevel: z.number().int().nonnegative().default(10),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;

// ==========================================
// ProductBatch Schemas
// ==========================================
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

export type CreateBatchDTO = z.infer<typeof createBatchSchema>;

// ==========================================
// Dispense Schemas
// ==========================================
export const dispenseItemInputSchema = z.object({
  productId: z.string().uuid("Invalid Product ID"),
  batchId: z.string().uuid("Invalid Batch ID"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.number().positive("Unit price must be positive"),
});

export const createDispenseRecordSchema = z.object({
  visitId: z.string().uuid("Invalid Visit ID").optional(),
  dispensedById: z.string().uuid("Invalid DispensedBy User ID"),
  prescriptionId: z.string().uuid("Invalid Prescription ID").optional(),
  notes: z.string().optional(),
  items: z
    .array(dispenseItemInputSchema)
    .min(1, "At least one item must be dispensed"),
});

export type DispenseItemInputDTO = z.infer<typeof dispenseItemInputSchema>;
export type CreateDispenseRecordDTO = z.infer<
  typeof createDispenseRecordSchema
>;

// ==========================================
// RabbitMQ Event Schemas
// ==========================================
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

export type ProductDispensedEvent = z.infer<typeof productDispensedEventSchema>;
export type ReorderLevelReachedEvent = z.infer<
  typeof reorderLevelReachedEventSchema
>;

// ==========================================
// RabbitMQ Routing Keys
// ==========================================
export enum PharmacyRoutingKey {
  DISPENSED = "pharmacy.product.dispensed",
  REORDER_LEVEL_REACHED = "pharmacy.product.reorder_level_reached",
}
