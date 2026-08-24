// src/services/billing.service.ts

import { PrismaClient, InvoiceStatus, PaymentStatus } from "@prisma/client";
import {
  CreatePaymentDTO,
  InvoiceResponseDTO,
} from "../../models/billing/billing.model";

const prisma = new PrismaClient();

export class BillingService {
  /**
   * Fetch an invoice by ID with all itemized charges and payments
   */
  async getInvoiceById(invoiceId: string): Promise<InvoiceResponseDTO> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    return this.mapToInvoiceDTO(invoice);
  }

  /**
   * Record a payment against an invoice and update invoice status/balance
   */
  async processPayment(
    invoiceId: string,
    dto: CreatePaymentDTO,
  ): Promise<InvoiceResponseDTO> {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const balanceDue = Number(invoice.balanceDue);
      if (balanceDue <= 0 || invoice.status === InvoiceStatus.PAID) {
        throw new Error("Invoice is already fully paid");
      }

      if (dto.amount > balanceDue) {
        throw new Error(
          `Payment amount (${dto.amount}) exceeds balance due (${balanceDue})`,
        );
      }

      // 1. Create Payment record
      const receiptNumber = `REC-${Date.now()}`;
      await tx.payment.create({
        data: {
          receiptNumber,
          invoiceId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          transactionRef: dto.transactionRef,
          receivedById: dto.receivedById,
          status: PaymentStatus.PAID,
        },
      });

      // 2. Calculate updated amounts
      const newAmountPaid = Number(invoice.amountPaid) + dto.amount;
      const newBalanceDue = Number(invoice.totalAmount) - newAmountPaid;

      let newStatus: InvoiceStatus = InvoiceStatus.PARTIALLY_PAID;
      if (newBalanceDue === 0) {
        newStatus = InvoiceStatus.PAID;
      }

      // 3. Update Invoice totals and status
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newStatus,
        },
        include: {
          items: true,
          payments: true,
        },
      });

      return this.mapToInvoiceDTO(updatedInvoice);
    });
  }

  private mapToInvoiceDTO(invoice: any): InvoiceResponseDTO {
    return {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      discount: Number(invoice.discount),
      insurancePay: Number(invoice.insurancePay),
      patientPay: Number(invoice.patientPay),
      totalAmount: Number(invoice.totalAmount),
      amountPaid: Number(invoice.amountPaid),
      balanceDue: Number(invoice.balanceDue),
      items: invoice.items.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      payments: invoice.payments.map((payment: any) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    };
  }
}
