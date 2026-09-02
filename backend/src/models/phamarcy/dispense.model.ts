// src/models/phamarcy/inventory.model.ts
import { z } from "zod";

export const DispenseItemDtoSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  batchId: z.string().uuid(),
});

export const CreateDispenseRecordDtoSchema = z.object({
  facilityId: z.string().uuid(),
  visitId: z.string().uuid().optional(),
  prescriptionId: z.string().uuid().optional(),
  dispensedById: z.string().uuid(),
  notes: z.string().optional(),
  items: z
    .array(DispenseItemDtoSchema)
    .min(1, "At least one item must be dispensed"),
});

export type DispenseItemDTO = z.infer<typeof DispenseItemDtoSchema>;
export type CreateDispenseRecordDTO = z.infer<
  typeof CreateDispenseRecordDtoSchema
>;
