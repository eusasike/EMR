import { z } from "zod";

export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "INSURANCE";

// --- Payment DTOs ---
export interface ProcessPaymentDTO {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string; // M-Pesa Code, Bank Reference, or Insurance Claim No
  processedById: string;
  notes?: string;
}

export interface PaymentDTO {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string | null;
  processedById: string;
  notes: string | null;
  createdAt: Date;
}

export interface PaymentResponseData {
  payment: PaymentDTO;
  invoice: {
    id: string;
    invoiceNumber: string;
    grandTotal: number;
    amountPaid: number;
    balance: number;
    status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  };
}

// --- Zod Schema ---
export const ProcessPaymentZodSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice ID format"),
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "INSURANCE"]),
  transactionReference: z.string().optional(),
  processedById: z.string().uuid("Invalid cashier ID format"),
  notes: z.string().optional(),
});
