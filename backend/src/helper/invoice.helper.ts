import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

export async function recalculateVisitInvoice(
  visitId: string,
  facilityId: string,
) {
  // 1. Fetch all provided services for this visit
  const providedServices = await prisma.providedService.findMany({
    where: { visitId },
  });

  // 2. Fetch all prescriptions and their items for this visit
  const prescriptions = await prisma.prescription.findMany({
    where: { visitId },
    include: { items: true },
  });

  // 3. Calculate service total safely
  const serviceTotal = providedServices.reduce(
    (sum, service) => sum + (Number(service.unitPrice) || 0),
    0,
  );

  // 4. Calculate medication total safely
  let medicationTotal = 0;
  prescriptions.forEach((rx) => {
    rx.items.forEach((item) => {
      const unitPrice = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantityOrdered) || 0;
      medicationTotal += unitPrice * quantity;
    });
  });

  const grandTotal =
    (Number(serviceTotal) || 0) + (Number(medicationTotal) || 0);

  // 5. Fetch existing invoice to preserve amountPaid and invoiceNumber if present
  const existingInvoice = await prisma.invoice.findUnique({
    where: { visitId },
  });

  const amountPaid = existingInvoice
    ? Number(existingInvoice.amountPaid) || 0
    : 0;
  const balance = grandTotal - amountPaid;

  const invoiceNumber =
    existingInvoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

  // 6. Upsert the invoice mapping service and medication totals separately
  return await prisma.invoice.upsert({
    where: { visitId },
    update: {
      serviceTotal: new Prisma.Decimal(serviceTotal),
      medicationTotal: new Prisma.Decimal(medicationTotal),
      grandTotal: new Prisma.Decimal(grandTotal),
      balance: new Prisma.Decimal(balance),
    },
    create: {
      facilityId,
      visitId,
      invoiceNumber,
      serviceTotal: new Prisma.Decimal(serviceTotal),
      medicationTotal: new Prisma.Decimal(medicationTotal),
      grandTotal: new Prisma.Decimal(grandTotal),
      amountPaid: new Prisma.Decimal(0),
      balance: new Prisma.Decimal(grandTotal),
      status: "PENDING",
      type: "FINAL",
    },
  });
}
