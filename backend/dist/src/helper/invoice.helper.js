"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateVisitInvoice = recalculateVisitInvoice;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
async function recalculateVisitInvoice(visitId, facilityId) {
    // 1. Fetch all provided services for this visit
    const providedServices = await database_1.prisma.providedService.findMany({
        where: { visitId },
    });
    // 2. Fetch all prescriptions and their items for this visit
    const prescriptions = await database_1.prisma.prescription.findMany({
        where: { visitId },
        include: { items: true },
    });
    // 3. Calculate service total safely
    const serviceTotal = providedServices.reduce((sum, service) => sum + (Number(service.unitPrice) || 0), 0);
    // 4. Calculate medication total safely
    let medicationTotal = 0;
    prescriptions.forEach((rx) => {
        rx.items.forEach((item) => {
            const unitPrice = Number(item.unitPrice) || 0;
            const quantity = Number(item.quantityOrdered) || 0;
            medicationTotal += unitPrice * quantity;
        });
    });
    const grandTotal = (Number(serviceTotal) || 0) + (Number(medicationTotal) || 0);
    // 5. Fetch existing invoice to preserve amountPaid and invoiceNumber if present
    const existingInvoice = await database_1.prisma.invoice.findUnique({
        where: { visitId },
    });
    const amountPaid = existingInvoice
        ? Number(existingInvoice.amountPaid) || 0
        : 0;
    const balance = grandTotal - amountPaid;
    const invoiceNumber = existingInvoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
    // 6. Upsert the invoice mapping service and medication totals separately
    return await database_1.prisma.invoice.upsert({
        where: { visitId },
        update: {
            serviceTotal: new client_1.Prisma.Decimal(serviceTotal),
            medicationTotal: new client_1.Prisma.Decimal(medicationTotal),
            grandTotal: new client_1.Prisma.Decimal(grandTotal),
            balance: new client_1.Prisma.Decimal(balance),
        },
        create: {
            facilityId,
            visitId,
            invoiceNumber,
            serviceTotal: new client_1.Prisma.Decimal(serviceTotal),
            medicationTotal: new client_1.Prisma.Decimal(medicationTotal),
            grandTotal: new client_1.Prisma.Decimal(grandTotal),
            amountPaid: new client_1.Prisma.Decimal(0),
            balance: new client_1.Prisma.Decimal(grandTotal),
            status: "PENDING",
            type: "FINAL",
        },
    });
}
