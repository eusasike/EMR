import { PrismaClient, LabStatus } from "@prisma/client";
import {
  OrderLabServiceDTO,
  RecordLabResultDTO,
} from "../../models/lab/lab.model";
import { LabPublisher } from "../../message/publisher/lab.publisher";
import { redisClient } from "../../config/redis";

const prisma = new PrismaClient();

export class LabService {
  /**
   * Create an initial LabResult entry when a lab service is ordered.
   */
  public async orderLabService(data: OrderLabServiceDTO) {
    const labResult = await prisma.labResult.create({
      data: {
        providedServiceId: data.providedServiceId,
        visitId: data.visitId,
        specimenType: data.specimenType,
        status: LabStatus.ORDERED,
      },
      include: {
        providedService: true,
      },
    });

    // Invalidate visit-related lab caches
    await redisClient.del(`cache:lab_results:visit:${data.visitId}`);

    // Publish event
    await LabPublisher.publishLabOrdered({
      labResultId: labResult.id,
      visitId: labResult.visitId,
      providedServiceId: labResult.providedServiceId,
      timestamp: labResult.createdAt.toISOString(),
    });

    return labResult;
  }

  /**
   * Enter lab results, findings, and mark as PERFORMED/COMPLETED.
   */
  public async recordResults(
    id: string,
    data: RecordLabResultDTO,
    performedById: string,
  ) {
    const existing = await prisma.labResult.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Lab result record not found.");
    }

    const updated = await prisma.labResult.update({
      where: { id },
      data: {
        resultValue: data.resultValue,
        unit: data.unit,
        referenceRange: data.referenceRange,
        findings: data.findings,
        specimenType: data.specimenType ?? existing.specimenType,
        status: data.status ?? LabStatus.COMPLETED,
        performedById: performedById,
      },
      include: {
        performedBy: { select: { id: true, name: true, email: true } },
      },
    });

    await redisClient.del(`cache:lab_results:visit:${updated.visitId}`);

    await LabPublisher.publishLabCompleted({
      labResultId: updated.id,
      visitId: updated.visitId,
      performedById,
      timestamp: updated.updatedAt.toISOString(),
    });

    return updated;
  }

  /**
   * Doctor/Lab Manager verifies and approves the final results.
   */
  public async verifyResult(
    id: string,
    verifiedById: string,
    findings?: string,
  ) {
    const updated = await prisma.labResult.update({
      where: { id },
      data: {
        status: LabStatus.VERIFIED,
        verifiedById: verifiedById,
        ...(findings ? { findings } : {}),
      },
      include: {
        verifiedBy: { select: { id: true, name: true, email: true } },
      },
    });

    await redisClient.del(`cache:lab_results:visit:${updated.visitId}`);

    await LabPublisher.publishLabVerified({
      labResultId: updated.id,
      visitId: updated.visitId,
      verifiedById,
      timestamp: updated.updatedAt.toISOString(),
    });

    return updated;
  }

  /**
   * Fetch lab results for a specific patient visit with Redis caching.
   */
  public async getResultsByVisit(visitId: string) {
    const cacheKey = `cache:lab_results:visit:${visitId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const results = await prisma.labResult.findMany({
      where: { visitId },
      include: {
        providedService: true,
        performedBy: { select: { id: true, name: true } },
        verifiedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    await redisClient.setex(cacheKey, 300, JSON.stringify(results)); // Cache for 5 mins
    return results;
  }
}
