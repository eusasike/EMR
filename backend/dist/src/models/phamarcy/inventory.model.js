"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacyRoutingKey = exports.reorderLevelReachedEventSchema = exports.productDispensedEventSchema = exports.createDispenseRecordSchema = exports.dispenseItemInputSchema = exports.createBatchSchema = exports.updateProductSchema = exports.createProductSchema = exports.ProductCategoryEnum = void 0;
// models/pharmacy/pharmacy.model.ts
const zod_1 = require("zod");
// ==========================================
// Enum Schemas
// ==========================================
exports.ProductCategoryEnum = zod_1.z.enum([
    "PILLS",
    "SYRINGES",
    "CAPSULE",
    "SYRUP",
]);
exports.createProductSchema = zod_1.z.object({
    code: zod_1.z.string().trim().optional(),
    name: zod_1.z.string().min(1, "Product name is required").trim(),
    description: zod_1.z.string().optional(),
    category: exports.ProductCategoryEnum.default("PILLS"),
    unitPrice: zod_1.z.number().positive("Unit price must be greater than zero"),
    reorderLevel: zod_1.z.number().int().nonnegative().default(10),
});
exports.updateProductSchema = exports.createProductSchema.partial();
exports.createBatchSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid Product ID"),
    batchNumber: zod_1.z.string().min(1, "Batch number is required").trim(),
    quantity: zod_1.z
        .number()
        .int()
        .positive("Initial quantity must be greater than zero"),
    costPrice: zod_1.z.number().positive("Cost price must be positive").optional(),
    expiryDate: zod_1.z
        .string()
        .datetime({ message: "Expiry date must be a valid ISO string" }),
});
exports.dispenseItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid Product ID"),
    batchId: zod_1.z.string().uuid("Invalid Batch ID"),
    quantity: zod_1.z.number().int().positive("Quantity must be at least 1"),
    unitPrice: zod_1.z.number().positive("Unit price must be positive"),
});
exports.createDispenseRecordSchema = zod_1.z.object({
    visitId: zod_1.z.string().uuid("Invalid Visit ID").optional(),
    dispensedById: zod_1.z.string().uuid("Invalid DispensedBy User ID").optional(),
    prescriptionId: zod_1.z.string().uuid("Invalid Prescription ID").optional(),
    notes: zod_1.z.string().optional(),
    items: zod_1.z
        .array(exports.dispenseItemInputSchema)
        .min(1, "At least one item must be dispensed"),
});
exports.productDispensedEventSchema = zod_1.z.object({
    dispenseRecordId: zod_1.z.string().uuid(),
    visitId: zod_1.z.string().uuid().nullable().optional(),
    dispensedById: zod_1.z.string().uuid(),
    totalCost: zod_1.z.number(),
    itemCount: zod_1.z.number(),
    timestamp: zod_1.z.string().datetime(),
});
exports.reorderLevelReachedEventSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    productName: zod_1.z.string(),
    currentStock: zod_1.z.number().int(),
    reorderLevel: zod_1.z.number().int(),
    timestamp: zod_1.z.string().datetime(),
});
var PharmacyRoutingKey;
(function (PharmacyRoutingKey) {
    PharmacyRoutingKey["DISPENSED"] = "pharmacy.product.dispensed";
    PharmacyRoutingKey["REORDER_LEVEL_REACHED"] = "pharmacy.product.reorder_level_reached";
})(PharmacyRoutingKey || (exports.PharmacyRoutingKey = PharmacyRoutingKey = {}));
