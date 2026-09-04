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
        grandTotal: Number(invoice.grandTotal),
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
    receivedById: string, // 👈 Passed as a separate argument from the controller session
  ): Promise<InvoiceResponseDTO> {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const totalAmount = Number(invoice.grandTotal);
      const paidAmount = Number(invoice.amountPaid);
      const balanceDue = totalAmount - paidAmount;

      if (balanceDue <= 0 || invoice.status === InvoiceStatus.PAID) {
        throw new Error("Invoice is already fully paid");
      }

      if (dto.amount > balanceDue) {
        throw new Error(
          `Payment amount (${dto.amount}) exceeds balance due (${balanceDue})`,
        );
      }

      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          // transactionRef: dto.transactionRef,
          receivedById,
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
          amountPaid: newPaidAmount,
          status: newStatus,
        },
        include: {
          payments: true,
          visit: {
            include: {
              patient: true,
            },
          },
        },
      });

      await BillingPublisher.publishPaymentReceived({
        paymentId: payment.id,
        invoiceId: updatedInvoice.id,
        amount: dto.amount,
        balanceRemaining: newBalanceDue,
        paymentMethod: dto.paymentMethod,
        timestamp: payment.createdAt.toISOString(),
      });

      return this.mapToInvoiceDTO(updatedInvoice);
    });
  }
  private mapToInvoiceDTO(invoice: any): InvoiceResponseDTO {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      serviceTotal: invoice.serviceTotal?.toString() || "0",
      medicationTotal: invoice.medicationTotal?.toString() || "0",
      grandTotal: invoice.grandTotal?.toString() || "0",
      amountPaid: invoice.amountPaid?.toString() || "0",
      balance: invoice.balance?.toString() || "0",
      status: invoice.status,
      type: invoice.type,
      createdAt: invoice.createdAt,

      // Guard nested arrays with (invoice.relation || []) to prevent undefined .map() crashes
      payments: (invoice.payments || []).map((payment: any) => ({
        id: payment.id,
        amount: payment.amount?.toString() || "0",
        method: payment.method,
        createdAt: payment.createdAt,
      })),

      visit: invoice.visit
        ? {
            id: invoice.visit.id,
            visitDate: invoice.visit.visitDate,
            patient: invoice.visit.patient
              ? {
                  id: invoice.visit.patient.id,
                  mrn: invoice.visit.patient.mrn,
                  firstName: invoice.visit.patient.firstName,
                  lastName: invoice.visit.patient.lastName,
                }
              : null,
          }
        : null,
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
        visit: {
          include: {
            patient: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fallback to an empty array if invoices is undefined or null
    return (invoices || []).map((invoice) => this.mapToInvoiceDTO(invoice));
  }
}
