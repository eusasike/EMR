// src/models/billing/billing.model.ts

import { z } from "zod";
import {
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
  ChargeType,
} from "@prisma/client";

// ==========================================
// 1. Explicit TypeScript Interfaces (for tsoa parsing)
// ==========================================

export interface CreateInvoiceItemDTO {
  chargeType: ChargeType;
  referenceId?: string | null;
  description: string;
  quantity?: number;
  unitPrice: number;
}

export interface CreateInvoiceDTO {
  visitId: string;
  patientId: string;
  notes?: string | null;
  items?: CreateInvoiceItemDTO[];
}

export interface RecordPaymentDTO {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string | null;
  receivedById: string;
}

export type CreatePaymentDTO = RecordPaymentDTO;

// ==========================================
// 2. Response DTO Interfaces
// ==========================================

export interface InvoiceItemResponseDTO {
  id: string;
  invoiceId: string;
  chargeType: ChargeType;
  referenceId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResponseDTO {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string | null;
  receivedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceResponseDTO {
  id: string;
  invoiceNumber: string;
  visitId: string;
  patientId: string;
  subtotal: number;
  tax: number;
  discount: number;
  insurancePay: number;
  patientPay: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes: string | null;
  items?: InvoiceItemResponseDTO[];
  payments?: PaymentResponseDTO[];
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// 3. Zod Runtime Validation Schemas
// ==========================================

export const createInvoiceItemSchema = z.object({
  chargeType: z.nativeEnum(ChargeType),
  referenceId: z.string().uuid("Invalid Reference ID").optional().nullable(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().positive("Quantity must be at least 1").default(1),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
});

export const createInvoiceSchema = z.object({
  visitId: z.string().uuid("Invalid Visit ID"),
  patientId: z.string().uuid("Invalid Patient ID"),
  notes: z.string().optional().nullable(),
  items: z.array(createInvoiceItemSchema).optional().default([]),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid Invoice ID"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionRef: z.string().optional().nullable(),
  receivedById: z.string().uuid("Invalid Staff/User ID"),
});
