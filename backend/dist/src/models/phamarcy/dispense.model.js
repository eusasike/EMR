"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDispenseRecordDtoSchema = exports.DispenseItemDtoSchema = void 0;
// src/models/phamarcy/inventory.model.ts
const zod_1 = require("zod");
exports.DispenseItemDtoSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive(),
    unitPrice: zod_1.z.number().positive(),
    batchId: zod_1.z.string().uuid(),
});
exports.CreateDispenseRecordDtoSchema = zod_1.z.object({
    facilityId: zod_1.z.string().uuid(),
    visitId: zod_1.z.string().uuid().optional(),
    prescriptionId: zod_1.z.string().uuid().optional(),
    dispensedById: zod_1.z.string().uuid(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z
        .array(exports.DispenseItemDtoSchema)
        .min(1, "At least one item must be dispensed"),
});
