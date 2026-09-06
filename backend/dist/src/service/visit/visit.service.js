"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitService = void 0;
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const visit_publisher_1 = require("../../message/publisher/visit.publisher");
const client_1 = require("@prisma/client");
const custom_error_1 = require("../../util/custom-error");
const VISIT_CACHE_TTL = 900; // 15 minutes TTL
class VisitService {
    /**
     * Create a new patient visit with context-injected facilityId and attendingId
     */
    /**
     * Create a new patient visit or update the existing active visit if one is already in progress
     */
    async createVisit(data) {
        // 1. Verify patient existence
        const patient = await database_1.prisma.patient.findUnique({
            where: { id: data.patientId },
        });
        if (!patient) {
            throw new custom_error_1.NotFoundError("PATIENT_NOT_FOUND");
        }
        // 2. Check if the patient already has an active visit (IN_PROGRESS or NOT_STARTED)
        const existingActiveVisit = await database_1.prisma.patientVisit.findFirst({
            where: {
                patientId: data.patientId,
                facilityId: data.facilityId,
                status: {
                    in: [client_1.VisitStatus.IN_PROGRESS, client_1.VisitStatus.NOT_STARTED],
                },
            },
            orderBy: { createdAt: "desc" },
        });
        let visit;
        if (existingActiveVisit) {
            // 3A. ALTERNATIVE A: Update the existing active visit instead of creating a duplicate
            visit = await database_1.prisma.patientVisit.update({
                where: { id: existingActiveVisit.id },
                data: {
                    attendingId: data.attendingId,
                    symptoms: data.symptoms !== undefined
                        ? data.symptoms
                        : existingActiveVisit.symptoms,
                    diagnosis: data.diagnosis !== undefined
                        ? data.diagnosis
                        : existingActiveVisit.diagnosis,
                    icdCode: data.icdCode !== undefined
                        ? data.icdCode
                        : existingActiveVisit.icdCode,
                    visitType: data.visitType ?? existingActiveVisit.visitType,
                    priority: data.priority ?? existingActiveVisit.priority,
                    status: data.status ?? existingActiveVisit.status,
                },
                include: {
                    patient: {
                        select: { mrn: true, firstName: true, lastName: true, phone: true },
                    },
                    attending: {
                        select: { id: true, firstName: true, lastName: true, role: true },
                    },
                },
            });
            // Publish update event instead of created event
            await (0, visit_publisher_1.publishVisitUpdatedEvent)({
                visitId: visit.id,
                facilityId: visit.facilityId,
                patientId: visit.patientId,
                attendingId: visit.attendingId,
                symptoms: visit.symptoms,
                diagnosis: visit.diagnosis,
                icdCode: visit.icdCode,
                priority: visit.priority,
                status: visit.status,
            }).catch((err) => console.error(`⚠️ [RabbitMQ Error] Failed to publish visit updated event: ${err.message}`));
        }
        else {
            // 3B. Persist new visit if no active visit exists
            visit = await database_1.prisma.patientVisit.create({
                data: {
                    facilityId: data.facilityId,
                    attendingId: data.attendingId,
                    patientId: data.patientId,
                    symptoms: data.symptoms ?? null,
                    diagnosis: data.diagnosis ?? null,
                    icdCode: data.icdCode ?? null,
                    visitType: data.visitType ?? client_1.VisitType.OPD,
                    priority: data.priority ?? client_1.VisitPriority.NORMAL,
                    status: data.status ?? client_1.VisitStatus.IN_PROGRESS,
                },
                include: {
                    patient: {
                        select: { mrn: true, firstName: true, lastName: true, phone: true },
                    },
                    attending: {
                        select: { id: true, firstName: true, lastName: true, role: true },
                    },
                },
            });
            // Publish creation event
            await (0, visit_publisher_1.publishVisitCreatedEvent)({
                visitId: visit.id,
                facilityId: visit.facilityId,
                patientId: visit.patientId,
                attendingId: visit.attendingId,
                priority: visit.priority,
                visitType: visit.visitType,
                status: visit.status,
            }).catch((err) => console.error(`⚠️ [RabbitMQ Error] Failed to publish visit created event: ${err.message}`));
        }
        // 4. Invalidate patient visits cache
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await Promise.all([
                redis_1.redisClient.del(`visit:${visit.id}`),
                redis_1.redisClient.del(`patient:${data.patientId}:visits`),
                redis_1.redisClient.del(`patient:mrn:${visit.patient.mrn}:visits`),
                redis_1.redisClient.del(`facility:${data.facilityId}:patient:mrn:${visit.patient.mrn}:visits`),
            ]).catch(() => { });
        }
        return visit;
    }
    /**
     * Updates clinical details or status on an active visit, emits update event, and flushes cache
     */
    async updateVisit(visitId, data) {
        const existingVisit = await database_1.prisma.patientVisit.findUnique({
            where: { id: visitId },
            include: { patient: { select: { mrn: true } } },
        });
        if (!existingVisit) {
            throw new custom_error_1.NotFoundError("VISIT_NOT_FOUND");
        }
        const updatedVisit = await database_1.prisma.patientVisit.update({
            where: { id: visitId },
            data: {
                ...(data.diagnosis !== undefined && { diagnosis: data.diagnosis }),
                ...(data.icdCode !== undefined && { icdCode: data.icdCode }),
                ...(data.symptoms !== undefined && { symptoms: data.symptoms }),
                ...(data.priority && { priority: data.priority }),
                ...(data.status && { status: data.status }), // Added status update mapping
                ...(data.attendingId && { attendingId: data.attendingId }),
            },
            include: {
                patient: { select: { mrn: true, firstName: true, lastName: true } },
                attending: {
                    select: { id: true, firstName: true, lastName: true, role: true },
                },
                vitalSigns: true,
            },
        });
        // Publish update event
        await (0, visit_publisher_1.publishVisitUpdatedEvent)({
            visitId: updatedVisit.id,
            facilityId: updatedVisit.facilityId,
            patientId: updatedVisit.patientId,
            attendingId: updatedVisit.attendingId,
            symptoms: updatedVisit.symptoms,
            diagnosis: updatedVisit.diagnosis,
            icdCode: updatedVisit.icdCode,
            priority: updatedVisit.priority,
            status: updatedVisit.status,
        }).catch((err) => console.error(`⚠️ [RabbitMQ Error] Failed to publish visit updated event: ${err.message}`));
        // Invalidate caches
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await Promise.all([
                redis_1.redisClient.del(`visit:${visitId}`),
                redis_1.redisClient.del(`patient:${updatedVisit.patientId}:visits`),
                redis_1.redisClient.del(`patient:mrn:${updatedVisit.patient.mrn}:visits`),
                redis_1.redisClient.del(`facility:${updatedVisit.facilityId}:patient:mrn:${updatedVisit.patient.mrn}:visits`),
            ]).catch(() => { });
        }
        return updatedVisit;
    }
    /**
     * Fetches full clinical encounter record with Redis caching
     */
    async getVisitById(visitId) {
        const cacheKey = `visit:${visitId}`;
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            const cachedVisit = await redis_1.redisClient.get(cacheKey);
            if (cachedVisit) {
                return JSON.parse(cachedVisit);
            }
        }
        const visit = await database_1.prisma.patientVisit.findUnique({
            where: { id: visitId },
            include: {
                patient: true,
                attending: {
                    select: { id: true, firstName: true, lastName: true, role: true },
                },
                vitalSigns: true,
                services: { include: { service: true, labResult: true } },
                prescriptions: {
                    include: { items: { include: { product: true } } },
                },
                invoice: { include: { payments: true } },
            },
        });
        if (!visit) {
            throw new custom_error_1.NotFoundError("VISIT_NOT_FOUND");
        }
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await redis_1.redisClient
                .setex(cacheKey, VISIT_CACHE_TTL, JSON.stringify(visit))
                .catch(() => { });
        }
        return visit;
    }
    /**
     * Retrieves all visits for a patient using their MRN within a specific facility
     */
    async getVisitsByMrn(mrn, facilityId) {
        const cacheKey = `facility:${facilityId}:patient:mrn:${mrn}:visits`;
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            const cachedVisits = await redis_1.redisClient.get(cacheKey);
            if (cachedVisits) {
                return JSON.parse(cachedVisits);
            }
        }
        // Pass the compound key facilityId_mrn using both variables
        const patient = await database_1.prisma.patient.findUnique({
            where: {
                facilityId_mrn: {
                    facilityId,
                    mrn,
                },
            },
            select: { id: true },
        });
        if (!patient) {
            throw new custom_error_1.NotFoundError(`PATIENT_NOT_FOUND: ${mrn}`);
        }
        const visits = await database_1.prisma.patientVisit.findMany({
            where: {
                patientId: patient.id,
                facilityId,
            },
            orderBy: { createdAt: "desc" },
            include: {
                patient: { select: { mrn: true, firstName: true, lastName: true } },
                attending: {
                    select: { id: true, firstName: true, lastName: true, role: true },
                },
                vitalSigns: true,
                services: {
                    select: {
                        id: true,
                        unitPrice: true,
                        service: { select: { name: true } },
                    },
                },
            },
        });
        if (redis_1.redisClient.status === "ready" || redis_1.redisClient.status === "connect") {
            await redis_1.redisClient
                .setex(cacheKey, VISIT_CACHE_TTL, JSON.stringify(visits))
                .catch(() => { });
        }
        return visits;
    }
    //updateVisit status
    async updateVisitStatus(visitId, status) {
        const visit = await database_1.prisma.patientVisit.update({
            where: { id: visitId },
            data: { status },
        });
        return visit;
    }
}
exports.VisitService = VisitService;
