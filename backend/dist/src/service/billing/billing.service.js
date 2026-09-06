"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const client_1 = require("@prisma/client");
const billing_publisher_1 = require("../../message/publisher/billing.publisher");
const prisma = new client_1.PrismaClient();
class BillingService {
    /**
     * Create a new itemized invoice for medical services or pharmacy items
     */
    async createInvoice(facilityId, dto) {
        return await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            (dto.items || []).forEach((item) => {
                const quantity = item.quantity ?? 1;
                const totalPrice = quantity * item.unitPrice;
                totalAmount += totalPrice;
            });
            const invoiceNumber = `INV-${Date.now()}`;
            const invoice = await tx.invoice.create({
                data: {
                    facilityId,
                    visitId: dto.visitId,
                    invoiceNumber,
                    grandTotal: totalAmount,
                    amountPaid: 0, // ✅ Fixed from paidAmount to amountPaid
                    status: client_1.InvoiceStatus.PENDING,
                },
                include: {
                    visit: true,
                    payments: true,
                },
            });
            await billing_publisher_1.BillingPublisher.publishInvoiceGenerated({
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
    async getInvoiceById(invoiceId) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                payments: true,
                visit: true,
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
    async processPayment(invoiceId, dto, receivedById) {
        return await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({
                where: { id: invoiceId },
                include: {
                    payments: true,
                    visit: true,
                },
            });
            if (!invoice) {
                throw new Error("Invoice not found");
            }
            const totalAmount = Number(invoice.grandTotal);
            const paidAmount = Number(invoice.amountPaid);
            const balanceDue = totalAmount - paidAmount;
            if (balanceDue <= 0 || invoice.status === client_1.InvoiceStatus.PAID) {
                throw new Error("Invoice is already fully paid");
            }
            if (dto.amount > balanceDue) {
                throw new Error(`Payment amount (${dto.amount}) exceeds balance due (${balanceDue})`);
            }
            const payment = await tx.payment.create({
                data: {
                    invoiceId,
                    amount: dto.amount,
                    paymentMethod: dto.paymentMethod,
                    receivedById,
                },
            });
            const newPaidAmount = paidAmount + dto.amount;
            let newStatus = client_1.InvoiceStatus.PENDING;
            if (totalAmount - newPaidAmount === 0) {
                newStatus = client_1.InvoiceStatus.PAID;
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
            await billing_publisher_1.BillingPublisher.publishPaymentReceived({
                paymentId: payment.id,
                invoiceId: updatedInvoice.id,
                amount: dto.amount,
                balanceRemaining: totalAmount - newPaidAmount,
                paymentMethod: dto.paymentMethod,
                timestamp: payment.createdAt.toISOString(),
            });
            return this.mapToInvoiceDTO(updatedInvoice);
        });
    }
    mapToInvoiceDTO(invoice) {
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
            payments: (invoice.payments || []).map((payment) => ({
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
    async getInvoicesByMrn(mrn) {
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
        return (invoices || []).map((invoice) => this.mapToInvoiceDTO(invoice));
    }
}
exports.BillingService = BillingService;
