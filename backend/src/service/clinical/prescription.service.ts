import { PrismaClient } from "@prisma/client";
import { CreatePrescriptionDTO } from "../../models/prescription/prescription.model";
import { redisClient } from "../../config/redis";
import { PrescriptionPublisher } from "../../message/publisher/prescription.publisher";
import { recalculateVisitInvoice } from "../../helper/invoice.helper"; // <-- Import your invoice recalculation helper
const prisma = new PrismaClient();

export class PrescriptionService {
  public async createPrescription(
    data: CreatePrescriptionDTO,
    prescribedById: string,
  ) {
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
    await recalculateVisitInvoice(
      prescription.visitId,
      prescription.facilityId,
    );

    // 4. Redis Caching & Cache Invalidation
    await redisClient.del("prescriptions:pending:all");
    await redisClient.setex(
      `prescription:${prescription.id}`,
      3600,
      JSON.stringify(prescription),
    );

    // 5. Publish Async Event to RabbitMQ
    PrescriptionPublisher.publishPrescriptionCreated({
      prescriptionId: prescription.id,
      prescriptionNumber: prescription.prescriptionNumber,
      visitId: prescription.visitId,
      prescribedById: prescription.prescribedById,
      itemCount: prescription.items.length,
      createdAt: prescription.createdAt,
    }).catch((err) =>
      console.error("Failed to publish RX creation event:", err.message),
    );

    return prescription;
  }

  public async getPendingPrescriptions() {
    const cacheKey = "prescriptions:pending:all";

    const cachedData = await redisClient.get(cacheKey);
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

    await redisClient.setex(
      cacheKey,
      300,
      JSON.stringify(pendingPrescriptions),
    );

    return pendingPrescriptions;
  }
}
