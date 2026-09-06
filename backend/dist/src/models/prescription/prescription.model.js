"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrescriptionSchema = exports.createPrescriptionItemSchema = exports.PrescriptionStatus = void 0;
const zod_1 = require("zod");
var PrescriptionStatus;
(function (PrescriptionStatus) {
    PrescriptionStatus["PENDING"] = "PENDING";
    PrescriptionStatus["PARTIALLY_DISPENSED"] = "PARTIALLY_DISPENSED";
    PrescriptionStatus["DISPENSED"] = "DISPENSED";
    PrescriptionStatus["CANCELLED"] = "CANCELLED";
})(PrescriptionStatus || (exports.PrescriptionStatus = PrescriptionStatus = {}));
exports.createPrescriptionItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid Product ID"),
    dosage: zod_1.z.string().min(1, "Dosage is required"),
    frequency: zod_1.z
        .string()
        .min(1, "Frequency is required (e.g., 'TID', '1x daily')"),
    durationDays: zod_1.z.number().int().positive("Duration must be at least 1 day"),
    quantityOrdered: zod_1.z
        .number()
        .int()
        .positive("Quantity ordered must be at least 1"),
    route: zod_1.z.string().optional(),
    instructions: zod_1.z.string().optional(),
    unitPrice: zod_1.z.number().positive("Unit price must be a positive number"), // <-- New required field
});
exports.createPrescriptionSchema = zod_1.z.object({
    facilityId: zod_1.z.string().uuid("Invalid Facility ID"),
    visitId: zod_1.z.string().uuid("Invalid Visit ID"),
    notes: zod_1.z.string().optional(),
    items: zod_1.z
        .array(exports.createPrescriptionItemSchema)
        .min(1, "Prescription must contain at least one item"),
});
