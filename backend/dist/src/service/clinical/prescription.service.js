"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const client_1 = require("@prisma/client");
const redis_1 = require("../../config/redis");
const prescription_publisher_1 = require("../../message/publisher/prescription.publisher");
const invoice_helper_1 = require("../../helper/invoice.helper"); // <-- Import your invoice recalculation helper
const prisma = new client_1.PrismaClient();
class PrescriptionService {
    async createPrescription(data, prescribedById) {
        // 1. Generate Atomic Prescription Number
        const timestamp = Date.now().toString().slice(-6);
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const prescriptionNumber = `RX-${timestamp}-${randomSuffix}`;
        // 2. Persist to PostgreSQL via Prisma
        const prescription = await prisma.prescription.create({
            data: {
                facilityId: data.facilityId,
                prescriptionNumber,
                visitId: data.visitId,
                prescribedById,
                notes: data.notes,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        dosage: item.dosage,
                        frequency: item.frequency,
                        durationDays: item.durationDays,
                        quantityOrdered: item.quantityOrdered,
                        route: item.route,
                        instructions: item.instructions,
                        unitPrice: item.unitPrice,
                    })),
                },
            },
            include: {
                items: { include: { product: true } },
                prescribedBy: { select: { id: true, email: true } },
            },
        });
        // 3. Automatically Recalculate Visit Invoice
        await (0, invoice_helper_1.recalculateVisitInvoice)(prescription.visitId, prescription.facilityId);
        // 4. Redis Caching & Cache Invalidation
        await redis_1.redisClient.del("prescriptions:pending:all");
        await redis_1.redisClient.setex(`prescription:${prescription.id}`, 3600, JSON.stringify(prescription));
        // 5. Publish Async Event to RabbitMQ
        prescription_publisher_1.PrescriptionPublisher.publishPrescriptionCreated({
            prescriptionId: prescription.id,
            prescriptionNumber: prescription.prescriptionNumber,
            visitId: prescription.visitId,
            prescribedById: prescription.prescribedById,
            itemCount: prescription.items.length,
            createdAt: prescription.createdAt,
        }).catch((err) => console.error("Failed to publish RX creation event:", err.message));
        return prescription;
    }
    async getPendingPrescriptions() {
        const cacheKey = "prescriptions:pending:all";
        const cachedData = await redis_1.redisClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const pendingPrescriptions = await prisma.prescription.findMany({
            where: { status: "PENDING" },
            include: {
                items: { include: { product: true } },
                prescribedBy: { select: { id: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        await redis_1.redisClient.setex(cacheKey, 300, JSON.stringify(pendingPrescriptions));
        return pendingPrescriptions;
    }
}
exports.PrescriptionService = PrescriptionService;
