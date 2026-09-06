"use strict";
// src/models/billing/billing.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPaymentSchema = exports.createInvoiceSchema = exports.createInvoiceItemSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// ==========================================
// 3. Zod Runtime Validation Schemas
// ==========================================
exports.createInvoiceItemSchema = zod_1.z.object({
    chargeType: zod_1.z.nativeEnum(client_1.ChargeType),
    referenceId: zod_1.z.string().uuid("Invalid Reference ID").optional().nullable(),
    description: zod_1.z.string().min(1, "Description is required"),
    quantity: zod_1.z.number().int().positive("Quantity must be at least 1").default(1),
    unitPrice: zod_1.z.number().min(0, "Unit price cannot be negative"),
});
exports.createInvoiceSchema = zod_1.z.object({
    visitId: zod_1.z.string().uuid("Invalid Visit ID"),
    facilityId: zod_1.z.string().uuid("Invalid Facility ID"),
    notes: zod_1.z.string().optional().nullable(),
    items: zod_1.z.array(exports.createInvoiceItemSchema).optional().default([]),
});
exports.recordPaymentSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid("Invalid Invoice ID"),
    amount: zod_1.z.number().positive("Payment amount must be greater than 0"),
    paymentMethod: zod_1.z.nativeEnum(client_1.PaymentMethod),
});
