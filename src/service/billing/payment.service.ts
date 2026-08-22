import { prisma } from "../../config/database";
import {
  ProcessPaymentDTO,
  PaymentDTO,
  PaymentResponseData,
} from "../../models/billing/payment.model";

export class PaymentService {
  /**
   * Process a payment against an invoice and recalculate balance atomically
   */
  async processPayment(input: ProcessPaymentDTO): Promise<PaymentResponseData> {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch Invoice
      const invoice = await tx.invoice.findUnique({
        where: { id: input.invoiceId },
      });

      if (!invoice) {
        const error: any = new Error(
          `Invoice with ID '${input.invoiceId}' not found`,
        );
        error.statusCode = 404;
        throw error;
      }

      if (invoice.status === "PAID") {
        const error: any = new Error("Invoice is already fully paid");
        error.statusCode = 400;
        throw error;
      }

      if (invoice.status === "CANCELLED") {
        const error: any = new Error(
          "Cannot process payment for a cancelled invoice",
        );
        error.statusCode = 400;
        throw error;
      }

      const currentBalance = Number(invoice.balance);
      if (input.amount > currentBalance) {
        const error: any = new Error(
          `Payment amount (${input.amount}) exceeds outstanding balance (${currentBalance})`,
        );
        error.statusCode = 400;
        throw error;
      }

      // 2. Validate Processing User / Cashier
      const cashier = await tx.user.findUnique({
        where: { id: input.processedById },
      });

      if (!cashier) {
        const error: any = new Error("Cashier user not found");
        error.statusCode = 404;
        throw error;
      }

      // 3. Record Payment
      const payment = await tx.payment.create({
        data: {
          invoiceId: input.invoiceId,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          referenceNo: input.transactionReference || null,
          receivedById: input.processedById,
          notes: input.notes || null,
        },
      });

      // 4. Update Invoice Totals & Status
      const updatedAmountPaid = Number(invoice.amountPaid) + input.amount;
      const updatedBalance = Number(invoice.grandTotal) - updatedAmountPaid;

      let updatedStatus: "PENDING" | "PARTIALLY_PAID" | "PAID" =
        "PARTIALLY_PAID";
      if (updatedBalance <= 0) {
        updatedStatus = "PAID";
      } else if (updatedAmountPaid === 0) {
        updatedStatus = "PENDING";
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: updatedAmountPaid,
          balance: updatedBalance,
          status: updatedStatus,
        },
      });

      return {
        payment: {
          id: payment.id,
          invoiceId: payment.invoiceId,
          amount: Number(payment.amount),
          paymentMethod: payment.paymentMethod as any,
          transactionReference: payment.referenceNo,
          processedById: payment.receivedById,
          notes: payment.notes,
          createdAt: payment.createdAt,
        },
        invoice: {
          id: updatedInvoice.id,
          invoiceNumber: updatedInvoice.invoiceNumber,
          grandTotal: Number(updatedInvoice.grandTotal),
          amountPaid: Number(updatedInvoice.amountPaid),
          balance: Number(updatedInvoice.balance),
          status: updatedInvoice.status,
        },
      };
    });
  }

  /**
   * Retrieve payment history for an invoice
   */
  async getPaymentsByInvoiceId(invoiceId: string): Promise<PaymentDTO[]> {
    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: "desc" },
    });

    return payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod as any,
      transactionReference: p.referenceNo,
      processedById: p.receivedById,
      notes: p.notes,
      createdAt: p.createdAt,
    }));
  }
}
