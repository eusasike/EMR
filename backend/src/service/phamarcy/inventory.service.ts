// service/pharmacy/inventory.service.ts
import { PrescriptionStatus, PrismaClient } from "@prisma/client";
import { redisClient } from "../../config/redis";
import { publishToQueue } from "../../config/rabbitmq";
import {
  CreateProductDTO,
  UpdateProductDTO,
  CreateBatchDTO,
  CreateDispenseRecordDTO,
  PharmacyRoutingKey,
  productDispensedEventSchema,
  ReorderLevelReachedEvent,
  reorderLevelReachedEventSchema,
} from "../../models/phamarcy/inventory.model";

const prisma = new PrismaClient();
const PHARMACY_EXCHANGE = "pharmacy_exchange";

const CACHE_KEYS = {
  ALL_PRODUCTS: (facilityId: string) => `facility:${facilityId}:products:all`,
  PRODUCT_BY_ID: (id: string) => `product:${id}`,
  REORDER_ALERT_LOCK: (id: string) => `reorder_alert:${id}`,
};

export class PharmacyService {
  // ----------------------------------------
  // Product Operations (Redis Cache-Aside)
  // ----------------------------------------
  async createProduct(facilityId: string, data: CreateProductDTO) {
    if (data.code) {
      const existingByCode = await prisma.product.findFirst({
        where: {
          facilityId,
          code: data.code,
        },
      });

      if (existingByCode) {
        throw new Error(
          `A product with code "${data.code}" already exists for this facility.`,
        );
      }
    }

    // Also check by name within the same facility to prevent duplicate names
    const existingByName = await prisma.product.findFirst({
      where: {
        facilityId,
        name: data.name,
      },
    });

    if (existingByName) {
      throw new Error(
        `A product with the name "${data.name}" already exists for this facility.`,
      );
    }

    const product = await prisma.product.create({
      data: {
        facilityId,
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        unitPrice: data.unitPrice,
        reorderLevel: data.reorderLevel,
      },
    });

    await redisClient.del(CACHE_KEYS.ALL_PRODUCTS(facilityId));
    return product;
  }

  async getAllProducts(facilityId: string) {
    const cacheKey = CACHE_KEYS.ALL_PRODUCTS(facilityId);
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const products = await prisma.product.findMany({
      where: { facilityId },
      include: { batches: true },
      orderBy: { createdAt: "desc" },
    });

    await redisClient.setex(cacheKey, 3600, JSON.stringify(products));
    return products;
  }

  async getProductById(id: string) {
    const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(id);
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const product = await prisma.product.findUnique({
      where: { id },
      include: { batches: true },
    });

    if (!product) throw new Error("Product not found");

    await redisClient.setex(cacheKey, 3600, JSON.stringify(product));
    return product;
  }

  async updateProduct(id: string, facilityId: string, data: UpdateProductDTO) {
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    await redisClient.del([
      CACHE_KEYS.PRODUCT_BY_ID(id),
      CACHE_KEYS.ALL_PRODUCTS(facilityId),
    ]);
    return product;
  }

  // ----------------------------------------
  // Batch Operations
  // ----------------------------------------
  async createBatch(facilityId: string, data: CreateBatchDTO) {
    // Verify product exists and belongs to the facility
    const product = await prisma.product.findFirst({
      where: { id: data.productId, facilityId },
    });

    if (!product) {
      throw new Error("Product not found or unauthorized for this facility");
    }

    // Check if a batch with the same batch number already exists for this product
    const existingBatch = await prisma.productBatch.findFirst({
      where: {
        productId: data.productId,
        batchNumber: data.batchNumber,
      },
    });

    if (existingBatch) {
      throw new Error(
        `Batch number "${data.batchNumber}" already exists for this product.`,
      );
    }

    const batch = await prisma.productBatch.create({
      data: {
        productId: data.productId,
        batchNumber: data.batchNumber,
        quantity: data.quantity,
        initialQty: data.quantity,
        costPrice: data.costPrice,
        expiryDate: new Date(data.expiryDate),
      },
    });

    await redisClient.del([
      CACHE_KEYS.PRODUCT_BY_ID(data.productId),
      CACHE_KEYS.ALL_PRODUCTS(facilityId),
    ]);

    await redisClient.del(CACHE_KEYS.REORDER_ALERT_LOCK(data.productId));

    return batch;
  }

  // ----------------------------------------
  // Dispense Operations & Reorder Checks
  // ----------------------------------------
  async dispenseProducts(
    facilityId: string,
    data: CreateDispenseRecordDTO,
    userId: string,
  ) {
    const totalCost = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const affectedProductIds = Array.from(
      new Set(data.items.map((i) => i.productId)),
    );

    const result = await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const updateResult = await tx.productBatch.updateMany({
          where: {
            id: item.batchId,
            quantity: { gte: item.quantity },
            product: { facilityId },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(
            `Insufficient stock or invalid Batch ID / Facility scope: ${item.batchId}`,
          );
        }
      }

      return await tx.dispenseRecord.create({
        data: {
          facilityId,
          visitId: data.visitId,
          dispensedById: userId,
          prescriptionId: data.prescriptionId,
          totalCost: totalCost,
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              batchId: item.batchId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
        },
        include: { items: true },
      });
    });

    const productCacheKeys = affectedProductIds.map((id) =>
      CACHE_KEYS.PRODUCT_BY_ID(id),
    );
    const keysToInvalidate = [
      ...productCacheKeys,
      CACHE_KEYS.ALL_PRODUCTS(facilityId),
    ];
    if (keysToInvalidate.length > 0) {
      await redisClient.del(keysToInvalidate);
    }

    const dispenseEventPayload = productDispensedEventSchema.parse({
      dispenseRecordId: result.id,
      visitId: result.visitId ?? undefined,
      dispensedById: result.dispensedById,
      totalCost: Number(result.totalCost),
      itemCount: result.items.length,
      timestamp: result.createdAt.toISOString(),
    });

    await publishToQueue(
      PHARMACY_EXCHANGE,
      PharmacyRoutingKey.DISPENSED,
      dispenseEventPayload,
    );

    await this.checkAndPublishReorderAlerts(affectedProductIds);

    return result;
  }
  // ----------------------------------------
  // Reorder Level Check & Redis Lock Helper
  // ----------------------------------------
  private async checkAndPublishReorderAlerts(
    productIds: string[],
  ): Promise<void> {
    for (const productId of productIds) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: { batches: true },
        });

        if (!product) continue;

        const currentStock = product.batches.reduce(
          (sum, batch) => sum + batch.quantity,
          0,
        );

        if (currentStock <= product.reorderLevel) {
          const alertLockKey = CACHE_KEYS.REORDER_ALERT_LOCK(productId);

          const lockAcquired = await redisClient.set(
            alertLockKey,
            "ALERTED",
            "EX",
            86400,
            "NX",
          );

          if (lockAcquired === "OK") {
            const reorderEventPayload: ReorderLevelReachedEvent =
              reorderLevelReachedEventSchema.parse({
                productId: product.id,
                productName: product.name,
                currentStock,
                reorderLevel: product.reorderLevel,
                timestamp: new Date().toISOString(),
              });

            await publishToQueue(
              PHARMACY_EXCHANGE,
              PharmacyRoutingKey.REORDER_LEVEL_REACHED,
              reorderEventPayload,
            );
          }
        }
      } catch (error) {
        console.error(
          `[Reorder Check Error] Failed reorder check for Product ID ${productId}:`,
          error,
        );
      }
    }
  }
  public async getPendingPrescriptions(facilityId?: string) {
    return await prisma.prescription.findMany({
      where: {
        ...(facilityId ? { visit: { facilityId } } : {}),
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
                batches: true,
              },
            },
          },
        },
      },
    });
  }

  public async getPrescriptionsByMrn(mrn: string, facilityId?: string) {
    return await prisma.prescription.findMany({
      where: {
        ...(facilityId ? { visit: { facilityId } } : {}),
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
        items: {
          include: {
            product: {
              include: {
                batches: true,
              },
            },
          },
        },
      },
    });
  }

  // ... inside your PharmacyService class:

  public async updatePrescriptionStatus(
    prescriptionId: string,
    status: string,
    facilityId: string,
  ) {
    const upperStatus = status.toUpperCase() as PrescriptionStatus;

    // Validate against the enum values
    const validStatuses = Object.values(PrescriptionStatus);
    if (!validStatuses.includes(upperStatus)) {
      throw new Error(
        `Invalid status value. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    const existingPrescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        facilityId: facilityId,
      },
    });

    if (!existingPrescription) {
      throw new Error(
        "Prescription not found or does not belong to this facility",
      );
    }

    const updatedPrescription = await prisma.prescription.update({
      where: {
        id: prescriptionId,
      },
      data: {
        status: upperStatus, // 👈 Now typed correctly as PrescriptionStatus enum
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        visit: {
          include: {
            patient: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Prescription status updated successfully",
      data: updatedPrescription,
    };
  }
}
