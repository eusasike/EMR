// service/pharmacy/pharmacy.service.ts
import { PrismaClient } from "@prisma/client";
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
  ALL_PRODUCTS: "products:all",
  PRODUCT_BY_ID: (id: string) => `product:${id}`,
  REORDER_ALERT_LOCK: (id: string) => `reorder_alert:${id}`,
};

export class PharmacyService {
  // ----------------------------------------
  // Product Operations (Redis Cache-Aside)
  // ----------------------------------------
  async createProduct(data: CreateProductDTO) {
    const product = await prisma.product.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        unitPrice: data.unitPrice,
        reorderLevel: data.reorderLevel,
      },
    });

    await redisClient.del(CACHE_KEYS.ALL_PRODUCTS);
    return product;
  }

  async getAllProducts() {
    const cached = await redisClient.get(CACHE_KEYS.ALL_PRODUCTS);
    if (cached) return JSON.parse(cached);

    const products = await prisma.product.findMany({
      include: { batches: true },
      orderBy: { createdAt: "desc" },
    });

    await redisClient.setex(
      CACHE_KEYS.ALL_PRODUCTS,
      3600,
      JSON.stringify(products),
    );
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

  async updateProduct(id: string, data: UpdateProductDTO) {
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    await redisClient.del([
      CACHE_KEYS.PRODUCT_BY_ID(id),
      CACHE_KEYS.ALL_PRODUCTS,
    ]);
    return product;
  }

  // ----------------------------------------
  // Batch Operations
  // ----------------------------------------
  async createBatch(data: CreateBatchDTO) {
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

    // Invalidate product caches to reflect updated batch stock
    await redisClient.del([
      CACHE_KEYS.PRODUCT_BY_ID(data.productId),
      CACHE_KEYS.ALL_PRODUCTS,
    ]);

    // Clear any existing reorder alert lock since new stock arrived
    await redisClient.del(CACHE_KEYS.REORDER_ALERT_LOCK(data.productId));

    return batch;
  }

  // ----------------------------------------
  // Dispense Operations & Reorder Checks
  // ----------------------------------------
  async dispenseProducts(data: CreateDispenseRecordDTO, userId: string) {
    const totalCost = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    // Extract unique product IDs affected by this dispense operation
    const affectedProductIds = Array.from(
      new Set(data.items.map((i) => i.productId)),
    );

    // 1. Transactional Database Operations
    const result = await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        // Atomic stock deduction: ensures quantity >= item.quantity
        const updateResult = await tx.productBatch.updateMany({
          where: {
            id: item.batchId,
            quantity: { gte: item.quantity },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(
            `Insufficient stock or invalid Batch ID: ${item.batchId}`,
          );
        }
      }

      // Persist DispenseRecord along with DispensedItems
      return await tx.dispenseRecord.create({
        data: {
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
            })),
          },
        },
        include: { items: true },
      });
    });

    // 2. Invalidate Product Caches
    const productCacheKeys = affectedProductIds.map((id) =>
      CACHE_KEYS.PRODUCT_BY_ID(id),
    );
    const keysToInvalidate = [...productCacheKeys, CACHE_KEYS.ALL_PRODUCTS];
    if (keysToInvalidate.length > 0) {
      await redisClient.del(keysToInvalidate);
    }

    // 3. Publish Dispense Event to RabbitMQ
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

    // 4. Asynchronously evaluate stock for reorder level alerts
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

        // Sum current remaining quantity across all batches
        const currentStock = product.batches.reduce(
          (sum, batch) => sum + batch.quantity,
          0,
        );

        // Check if stock has reached or fallen below the threshold
        if (currentStock <= product.reorderLevel) {
          const alertLockKey = CACHE_KEYS.REORDER_ALERT_LOCK(productId);

          // Atomic Redis Lock with 24-Hour TTL (86,400s) using "NX" (Only Set If Not Exists)
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
}
