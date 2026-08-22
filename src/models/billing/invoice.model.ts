import { z } from "zod";
// --- Invoice Payload DTOs ---
export interface InvoiceItemSummaryDTO {
  type: "SERVICE" | "MEDICATION";
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  visitId: string;
  serviceTotal: number;
  medicationTotal: number;
  grandTotal: number;
  amountPaid: number;
  balance: number;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  itemsSummary: InvoiceItemSummaryDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateInvoiceDTO {
  visitId: string;
}

// --- Zod Validation Schema ---
export const GenerateInvoiceZodSchema = z.object({
  visitId: z.string().uuid("Invalid visit ID format"),
});
