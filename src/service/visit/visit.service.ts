import { prisma } from "../../config/database";
import { redisClient } from "../../config/redis";
import {
  publishVisitCreatedEvent,
  publishVisitUpdatedEvent,
} from "../../message/publisher/visit.publisher";
import { CreateVisitDTO, UpdateVisitDTO } from "../../models/visit/visit.model";
import { VisitPriority, VisitType } from "@prisma/client";
import { NotFoundError } from "../../util/custom-error";

const VISIT_CACHE_TTL = 900; // 15 minutes TTL

export class VisitService {
  /**
   * Create a new patient visit, publish RabbitMQ event, and clear patient cache
   */
  async createVisit(data: CreateVisitDTO) {
    // 1. Parallel verification for speed
    const [patient, attending] = await Promise.all([
      prisma.patient.findUnique({ where: { id: data.patientId } }),
      prisma.user.findUnique({ where: { id: data.attendingId } }),
    ]);

    if (!patient) throw new Error("PATIENT_NOT_FOUND");
    if (!attending) throw new Error("ATTENDING_STAFF_NOT_FOUND");

    // 2. Database Creation
    const visit = await prisma.patientVisit.create({
      data: {
        patientId: data.patientId,
        attendingId: data.attendingId,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis ?? null,
        icdCode: data.icdCode ?? null,
        visitType: data.visitType ?? VisitType.OPD,
        priority: data.priority ?? VisitPriority.NORMAL,
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

    // 3. Publish asynchronous message event
    await publishVisitCreatedEvent({
      visitId: visit.id,
      patientId: visit.patientId,
      attendingId: visit.attendingId,
      priority: visit.priority,
      visitType: visit.visitType,
    });

    // 4. Invalidate patient visits cache
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await redisClient.del(`patient:${data.patientId}:visits`);
    }

    return visit;
  }

  /**
   * Updates clinical details on an active visit, emits update event, and flushes cache
   */
  async updateVisit(visitId: string, data: UpdateVisitDTO) {
    const existingVisit = await prisma.patientVisit.findUnique({
      where: { id: visitId },
    });
    if (!existingVisit) throw new Error("VISIT_NOT_FOUND");

    const updatedVisit = await prisma.patientVisit.update({
      where: { id: visitId },
      data: {
        ...(data.diagnosis && { diagnosis: data.diagnosis }),
        ...(data.icdCode && { icdCode: data.icdCode }),
        ...(data.symptoms && { symptoms: data.symptoms }),
        ...(data.priority && { priority: data.priority }),
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
    await publishVisitUpdatedEvent({
      visitId: updatedVisit.id,
      patientId: updatedVisit.patientId,
      attendingId: updatedVisit.attendingId,
      symptoms: updatedVisit.symptoms,
      diagnosis: updatedVisit.diagnosis,
      icdCode: updatedVisit.icdCode,
      priority: updatedVisit.priority,
    });

    // Invalidate caches
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await Promise.all([
        redisClient.del(`visit:${visitId}`),
        redisClient.del(`patient:${updatedVisit.patientId}:visits`),
      ]);
    }

    return updatedVisit;
  }

  /**
   * Fetches full clinical encounter record with Redis caching
   */
  async getVisitById(visitId: string) {
    const cacheKey = `visit:${visitId}`;

    if (redisClient.status === "ready" || redisClient.status === "connect") {
      const cachedVisit = await redisClient.get(cacheKey);
      if (cachedVisit) {
        return JSON.parse(cachedVisit);
      }
    }

    const visit = await prisma.patientVisit.findUnique({
      where: { id: visitId },
      include: {
        patient: true,
        attending: { select: { firstName: true, lastName: true, role: true } },
        vitalSigns: true,
        services: { include: { service: true, labResult: true } },
        prescriptions: {
          include: { items: { include: { product: true } } },
        },
        invoice: { include: { payments: true } },
      },
    });

    if (!visit) throw new Error("VISIT_NOT_FOUND");

    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await redisClient.setex(cacheKey, VISIT_CACHE_TTL, JSON.stringify(visit));
    }

    return visit;
  }

  /**
   * Retrieves all visits for a specific patient
   */
  /**
   * Retrieves all visits for a patient using their MRN with Redis caching
   */
  async getVisitsByMrn(mrn: string) {
    const cacheKey = `patient:mrn:${mrn}:visits`;

    // 1. Check Redis Cache
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      const cachedVisits = await redisClient.get(cacheKey);
      if (cachedVisits) {
        return JSON.parse(cachedVisits);
      }
    }

    // 2. Fetch patient by MRN first to verify existence
    const patient = await prisma.patient.findUnique({
      where: { mrn },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundError(`PATIENT_NOT_FOUND: ${mrn}`);
    }

    // 3. Fetch visits using the patient ID resolved from the MRN lookup
    const visits = await prisma.patientVisit.findMany({
      where: { patientId: patient.id },
      select: {
        id: true,
        createdAt: true,
        patient: { select: { firstName: true, lastName: true } },
        attending: { select: { firstName: true, lastName: true } },
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
    // 4. Cache results in Redis
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await redisClient.setex(
        cacheKey,
        VISIT_CACHE_TTL,
        JSON.stringify(visits),
      );
    }

    return visits;
  }
}
