import { Prisma, VisitStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { redisClient } from "../../config/redis";
import { CreateDispenseRecordDTO } from "../../models/phamarcy/dispense.model";

const DISPENSE_CACHE_TTL = 3600;

export class DispenseService {
  /**
   * Publishes asynchronous events to RabbitMQ.
   */
  private async publishEvent(routingKey: string, payload: any) {
    try {
      console.log(`[RabbitMQ Event] Publishing to ${routingKey}:`, payload);
    } catch (error: any) {
      console.error(
        `⚠️ [RabbitMQ Error] Event publish failed for key ${routingKey}:`,
        error.message,
      );
    }
  }

  /**
   * Retrieves pending prescriptions with caching.
   */
  async getPendingPrescriptions(facilityId?: string) {
    const cacheKey = `pharmacy:pending-prescriptions:${facilityId || "all"}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err: any) {
      console.warn(
        `⚠️ [Redis Error] Bypassing prescriptions cache: ${err.message}`,
      );
    }

    const prescriptions = await prisma.prescription.findMany({
      where: facilityId ? { facilityId } : undefined,
      include: {
        visit: {
          include: {
            patient: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    await redisClient
      .set(cacheKey, JSON.stringify(prescriptions), "EX", 60)
      .catch(() => {});
    return prescriptions;
  }

  /**
   * Retrieves a dispense record by ID with caching and relational details.
   */
  async getDispenseRecordById(id: string) {
    const cacheKey = `dispense:record:${id}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err: any) {
      console.warn(
        `⚠️ [Redis Error] Bypassing dispense record cache: ${err.message}`,
      );
    }

    const record = await prisma.dispenseRecord.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            batch: true,
          },
        },
        visit: {
          include: {
            patient: true,
          },
        },
        dispensedBy: true,
      },
    });

    if (record) {
      await redisClient
        .set(cacheKey, JSON.stringify(record), "EX", DISPENSE_CACHE_TTL)
        .catch(() => {});
    }

    return record;
  }

  /**
   * Creates a dispense record, decrements stock per batch, completes the visit,
   * updates Redis caches, and publishes an event.
   */
  async dispensePrescription(data: CreateDispenseRecordDTO) {
    const result = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;

      const formattedItems = data.items.map((item) => {
        const subtotal = Number(item.unitPrice) * item.quantity;
        calculatedTotal += subtotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          batchId: item.batchId,
        };
      });

      let dispenseRecord;

      // 1. Explicitly check if a record already exists for this visit
      if (data.visitId) {
        const existingRecord = await tx.dispenseRecord.findUnique({
          where: { visitId: data.visitId },
        });

        if (existingRecord) {
          // Update existing record and refresh items
          dispenseRecord = await tx.dispenseRecord.update({
            where: { id: existingRecord.id },
            data: {
              prescriptionId: data.prescriptionId,
              dispensedById: data.dispensedById,
              totalCost: calculatedTotal,
              notes: data.notes,
              items: {
                deleteMany: {},
                create: formattedItems,
              },
            },
            include: {
              items: {
                include: {
                  product: true,
                  batch: true,
                },
              },
              visit: true,
            },
          });
        }
      }

      // 2. If no record exists, create a new one safely
      if (!dispenseRecord) {
        dispenseRecord = await tx.dispenseRecord.create({
          data: {
            facilityId: data.facilityId,
            visitId: data.visitId,
            prescriptionId: data.prescriptionId,
            dispensedById: data.dispensedById,
            totalCost: calculatedTotal,
            notes: data.notes,
            items: {
              create: formattedItems,
            },
          },
          include: {
            items: {
              include: {
                product: true,
                batch: true,
              },
            },
            visit: true,
          },
        });
      }

      // Decrement stock levels for each batch
      for (const item of data.items) {
        await tx.productBatch.update({
          where: { id: item.batchId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      if (data.visitId) {
        await tx.patientVisit.update({
          where: { id: data.visitId },
          data: {
            status: VisitStatus.COMPLETED,
          },
        });
      }

      return dispenseRecord;
    });

    try {
      await Promise.all([
        redisClient.del(`pharmacy:pending-prescriptions:${data.facilityId}`),
        redisClient.del(`pharmacy:pending-prescriptions:all`),
        redisClient.set(
          `dispense:record:${result.id}`,
          JSON.stringify(result),
          "EX",
          DISPENSE_CACHE_TTL,
        ),
      ]);
    } catch (cacheError: any) {
      console.error(
        `⚠️ [Redis Cache Error] Failed to update cache on dispense:`,
        cacheError.message,
      );
    }

    await this.publishEvent("pharmacy.dispensed", {
      dispenseRecordId: result.id,
      visitId: data.visitId,
      facilityId: data.facilityId,
      dispensedById: data.dispensedById,
      totalCost: Number(result.totalCost),
      items: result.items,
      timestamp: new Date().toISOString(),
    });

    return result;
  }
  // src/services/dispense/dispense.service.ts
  async getPrescriptionsByMrn(mrn: string, facilityId?: string) {
    const cacheKey = `pharmacy:prescriptions:mrn:${mrn}:${facilityId || "all"}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err: any) {
      console.warn(
        `⚠️ [Redis Error] Bypassing MRN prescription cache: ${err.message}`,
      );
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        ...(facilityId ? { facilityId } : {}),
        visit: {
          patient: {
            mrn: {
              equals: mrn.trim(),
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
        items: {
          include: {
            product: {
              include: {
                batches: {
                  where: { quantity: { gt: 0 } },
                  orderBy: { expiryDate: "asc" },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    await redisClient
      .set(cacheKey, JSON.stringify(prescriptions), "EX", 120)
      .catch(() => {});
    return prescriptions;
  }
}
