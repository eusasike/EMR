import { prisma } from "../../config/database";
import {
  InvoiceDTO,
  InvoiceItemSummaryDTO,
} from "../../models/billing/invoice.model";

export class InvoiceService {
  /**
   * Generates or recalculates a consolidated invoice for a patient visit
   */
  async generateOrUpdateInvoice(visitId: string): Promise<InvoiceDTO> {
    // 1. Retrieve Patient Visit with both ProvidedServices and Pharmacy DispenseRecord
    const visit = await prisma.patientVisit.findUnique({
      where: { id: visitId },
      include: {
        services: {
          include: {
            service: { select: { name: true, category: true } },
          },
        },
        dispenseRecord: {
          include: {
            items: {
              include: {
                product: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!visit) {
      const error: any = new Error(
        `Patient visit with ID '${visitId}' not found`,
      );
      error.statusCode = 404;
      throw error;
    }

    const itemsSummary: InvoiceItemSummaryDTO[] = [];

    // 2. Aggregate Medical Services (Consultations, Labs, Radiology, Procedures)
    let serviceTotal = 0;
    for (const serviceEntry of visit.services) {
      const price = Number(serviceEntry.unitPrice);
      serviceTotal += price;

      itemsSummary.push({
        type: "SERVICE",
        name: serviceEntry.service?.name || "Medical Service",
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
      });
    }

    // 3. Aggregate Pharmacy Dispense Record
    let medicationTotal = 0;
    if (visit.dispenseRecord) {
      medicationTotal = Number(visit.dispenseRecord.totalCost);

      for (const item of visit.dispenseRecord.items) {
        const unitPrice = Number(item.unitPrice);
        const totalPrice = unitPrice * item.quantity;

        itemsSummary.push({
          type: "MEDICATION",
          name: item.product?.name || "Medication",
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });
      }
    }

    const grandTotal = serviceTotal + medicationTotal;

    // 4. Check if an Invoice already exists for this Visit
    const existingInvoice = await prisma.invoice.findUnique({
      where: { visitId },
    });

    if (existingInvoice) {
      const amountPaid = Number(existingInvoice.amountPaid);
      const balance = grandTotal - amountPaid;

      // Determine payment status
      let status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "CANCELLED" =
        existingInvoice.status;
      if (status !== "CANCELLED") {
        if (balance <= 0 && grandTotal > 0) {
          status = "PAID";
        } else if (amountPaid > 0 && balance > 0) {
          status = "PARTIALLY_PAID";
        } else {
          status = "PENDING";
        }
      }

      const updated = await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          serviceTotal,
          medicationTotal,
          grandTotal,
          balance,
          status,
        },
      });

      return {
        id: updated.id,
        invoiceNumber: updated.invoiceNumber,
        visitId: updated.visitId,
        serviceTotal: Number(updated.serviceTotal),
        medicationTotal: Number(updated.medicationTotal),
        grandTotal: Number(updated.grandTotal),
        amountPaid: Number(updated.amountPaid),
        balance: Number(updated.balance),
        status: updated.status,
        itemsSummary,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    }

    // 5. Create New Invoice if one doesn't exist yet
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${timestamp}`;

    const created = await prisma.invoice.create({
      data: {
        invoiceNumber,
        visitId,
        serviceTotal,
        medicationTotal,
        grandTotal,
        amountPaid: 0,
        balance: grandTotal,
        status: "PENDING",
      },
    });

    return {
      id: created.id,
      invoiceNumber: created.invoiceNumber,
      visitId: created.visitId,
      serviceTotal: Number(created.serviceTotal),
      medicationTotal: Number(created.medicationTotal),
      grandTotal: Number(created.grandTotal),
      amountPaid: Number(created.amountPaid),
      balance: Number(created.balance),
      status: created.status,
      itemsSummary,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  /**
   * Fetch Invoice details by Visit ID
   */
  async getInvoiceByVisitId(visitId: string): Promise<InvoiceDTO> {
    return this.generateOrUpdateInvoice(visitId);
  }
}
