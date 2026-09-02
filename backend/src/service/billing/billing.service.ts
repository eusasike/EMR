import { PrismaClient, InvoiceStatus, PaymentStatus } from "@prisma/client";
import {
  CreateInvoiceDTO,
  CreatePaymentDTO,
  InvoiceResponseDTO,
} from "../../models/billing/billing.model";
import { BillingPublisher } from "../../message/publisher/billing.publisher";

const prisma = new PrismaClient();

export class BillingService {
  /**
   * Create a new itemized invoice for medical services or pharmacy items
   */
  async createInvoice(
    facilityId: string,
    dto: CreateInvoiceDTO,
  ): Promise<InvoiceResponseDTO> {
    return await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const processedItems = (dto.items || []).map((item) => {
        const quantity = item.quantity ?? 1;
        const totalPrice = quantity * item.unitPrice;
        totalAmount += totalPrice;

        return {
          chargeType: item.chargeType,
          referenceId: item.referenceId || null,
          description: item.description,
          quantity,
          unitPrice: item.unitPrice,
          totalPrice,
        };
      });

      const invoiceNumber = `INV-${Date.now()}`;

      const invoice = await tx.invoice.create({
        data: {
          facilityId,
          visitId: dto.visitId,
          invoiceNumber,
          totalAmount,
          paidAmount: 0,
          status: InvoiceStatus.PENDING,
          items: {
            create: processedItems,
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      await BillingPublisher.publishInvoiceGenerated({
        invoiceId: invoice.id,
        visitId: invoice.visitId || "",
        invoiceNumber: invoice.invoiceNumber,
        grandTotal: Number(invoice.totalAmount),
        timestamp: invoice.createdAt.toISOString(),
      });

      return this.mapToInvoiceDTO(invoice);
    });
  }

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
   * Process a payment against an outstanding invoice
   */
  async processPayment(
    invoiceId: string,
    dto: CreatePaymentDTO,
  ): Promise<InvoiceResponseDTO> {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { items: true, payments: true },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const totalAmount = Number(invoice.totalAmount);
      const paidAmount = Number(invoice.paidAmount);
      const balanceDue = totalAmount - paidAmount;

      if (balanceDue <= 0 || invoice.status === InvoiceStatus.PAID) {
        throw new Error("Invoice is already fully paid");
      }

      if (dto.amount > balanceDue) {
        throw new Error(
          `Payment amount (${dto.amount}) exceeds balance due (${balanceDue})`,
        );
      }

      const receiptNumber = `REC-${Date.now()}`;
      const payment = await tx.payment.create({
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

      const newPaidAmount = paidAmount + dto.amount;
      const newBalanceDue = totalAmount - newPaidAmount;

      let newStatus: InvoiceStatus = InvoiceStatus.PENDING;
      if (newBalanceDue === 0) {
        newStatus = InvoiceStatus.PAID;
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
        include: {
          items: true,
          payments: true,
        },
      });

      await BillingPublisher.publishPaymentReceived({
        paymentId: payment.id,
        invoiceId: updatedInvoice.id,
        amount: dto.amount,
        balanceRemaining: newBalanceDue,
        paymentMethod: dto.paymentMethod,
        receivedById: dto.receivedById,
        timestamp: payment.createdAt.toISOString(),
      });

      return this.mapToInvoiceDTO(updatedInvoice);
    });
  }

  private mapToInvoiceDTO(invoice: any): InvoiceResponseDTO {
    const totalAmount = Number(invoice.totalAmount);
    const amountPaid = Number(invoice.paidAmount);
    const balanceDue = totalAmount - amountPaid;

    return {
      ...invoice,
      totalAmount,
      amountPaid,
      balanceDue,
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

  async getInvoicesByMrn(mrn: string): Promise<InvoiceResponseDTO[]> {
    const invoices = await prisma.invoice.findMany({
      where: {
        visit: {
          patient: {
            mrn: {
              equals: mrn,
              mode: "insensitive",
            },
          },
        },
      },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return invoices.map((invoice) => this.mapToInvoiceDTO(invoice));
  }
}
