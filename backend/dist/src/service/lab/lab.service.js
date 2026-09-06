"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabService = void 0;
const client_1 = require("@prisma/client");
const lab_publisher_1 = require("../../message/publisher/lab.publisher");
const redis_1 = require("../../config/redis");
const custom_error_1 = require("../../util/custom-error");
const prisma = new client_1.PrismaClient();
class LabService {
    /**
     * Create an initial LabResult entry when a lab service is ordered.
     */
    async orderLabService(data) {
        const labResult = await prisma.labResult.create({
            data: {
                providedServiceId: data.providedServiceId,
                visitId: data.visitId,
                specimenType: data.specimenType,
                status: client_1.LabStatus.ORDERED,
            },
            include: {
                providedService: true,
            },
        });
        // Invalidate visit-related lab caches
        await redis_1.redisClient.del(`cache:lab_results:visit:${data.visitId}`);
        // Publish event
        await lab_publisher_1.LabPublisher.publishLabOrdered({
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
    async recordResults(id, data, performedById) {
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
                status: data.status ?? client_1.LabStatus.COMPLETED,
                performedById: performedById,
            },
            include: {
                performedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
        await redis_1.redisClient.del(`cache:lab_results:visit:${updated.visitId}`);
        await lab_publisher_1.LabPublisher.publishLabCompleted({
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
    async verifyResult(id, verifiedById, findings) {
        const updated = await prisma.labResult.update({
            where: { id },
            data: {
                status: client_1.LabStatus.VERIFIED,
                verifiedById: verifiedById,
                ...(findings ? { findings } : {}),
            },
            include: {
                verifiedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
        });
        await redis_1.redisClient.del(`cache:lab_results:visit:${updated.visitId}`);
        await lab_publisher_1.LabPublisher.publishLabVerified({
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
    async getResultsByVisit(visitId) {
        const cacheKey = `cache:lab_results:visit:${visitId}`;
        const cachedData = await redis_1.redisClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const results = await prisma.labResult.findMany({
            where: { visitId },
            include: {
                providedService: true,
                performedBy: {
                    select: { id: true, firstName: true, lastName: true },
                },
                verifiedBy: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        await redis_1.redisClient.setex(cacheKey, 300, JSON.stringify(results)); // Cache for 5 mins
        return results;
    }
    /**
     * Fetch lab results and orders for a patient using their MRN
     */
    async getLabResultsByMrn(mrn, facilityId) {
        const patient = await prisma.patient.findFirst({
            where: {
                mrn,
                ...(facilityId && { facilityId }),
            },
            select: { id: true },
        });
        if (!patient) {
            throw new custom_error_1.NotFoundError(`PATIENT_NOT_FOUND_FOR_MRN: ${mrn}`);
        }
        return await prisma.labResult.findMany({
            where: {
                visit: {
                    patientId: patient.id,
                },
            },
            include: {
                providedService: {
                    include: {
                        service: {
                            select: {
                                id: true,
                                name: true,
                                category: true,
                                price: true,
                            },
                        },
                    },
                },
                visit: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                    },
                },
                performedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                verifiedBy: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
}
exports.LabService = LabService;
