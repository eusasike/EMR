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
  facilityId: string;
  notes?: string | null;
  items?: CreateInvoiceItemDTO[];
}

export interface RecordPaymentDTO {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
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
  unitPrice: string | number;
  totalPrice: string | number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResponseDTO {
  id: string;
  receiptNumber?: string;
  invoiceId?: string;
  amount: string | number;
  paymentMethod: PaymentMethod;
  status?: PaymentStatus;
  createdAt: Date;
}

export interface PatientSummaryDTO {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
}

export interface VisitSummaryDTO {
  id: string;
  visitDate: Date;
  patient: PatientSummaryDTO | null;
}

export interface InvoiceResponseDTO {
  id: string;
  invoiceNumber: string;
  visitId?: string;
  serviceTotal: string | number;
  medicationTotal: string | number;
  grandTotal: string | number;
  amountPaid: string | number;
  balance: string | number;
  status: InvoiceStatus;
  type: string;
  notes?: string | null;
  items?: InvoiceItemResponseDTO[];
  payments?: PaymentResponseDTO[];
  visit?: VisitSummaryDTO | null;
  createdAt: Date;
  updatedAt?: Date;
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
  facilityId: z.string().uuid("Invalid Facility ID"),
  notes: z.string().optional().nullable(),
  items: z.array(createInvoiceItemSchema).optional().default([]),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid Invoice ID"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMethod: z.nativeEnum(PaymentMethod),
});
