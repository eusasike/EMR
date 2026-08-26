import {
  VitalSigns,
  TriagePriority,
  Prisma,
  VisitStatus,
} from "@prisma/client";
import { prisma } from "../../config/database";
import { redisClient } from "../../config/redis";
import {
  publishVitalSignsRecordedEvent,
  publishVitalSignsUpdatedEvent,
  publishRealtimeAlertEvent,
} from "../../message/publisher/vital-sign.publisher";
import {
  CreateVitalSignsInput,
  UpdateVitalSignsInput,
  VitalSignsQueryInput,
} from "../../models/visit/vital-sign.model";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../util/custom-error";

const VITAL_SIGNS_CACHE_TTL = 3600; // 1 hour TTL

export class VitalSignsService {
  /**
   * Calculates Body Mass Index (BMI)
   */
  private calculateBMI(weightKg: number, heightCm?: number): number {
    if (!heightCm || heightCm <= 0) return 0;
    const heightMeters = heightCm / 100;
    return Math.round((weightKg / (heightMeters * heightMeters)) * 10) / 10;
  }

  /**
   * Automatically determines triage priority based on vital thresholds
   */
  private evaluateTriagePriority(
    input: Partial<CreateVitalSignsInput>,
  ): TriagePriority {
    if (input.priority) return input.priority;

    const spo2 = input.spo2 ?? 100;
    const sys = input.systolicBP ?? 120;
    const pulse = input.pulseRate ?? 75;

    if (spo2 < 90 || sys > 180 || sys < 80 || pulse > 130) {
      return TriagePriority.RED;
    }
    if (spo2 <= 94 || sys >= 140 || pulse >= 100) {
      return TriagePriority.YELLOW;
    }
    return TriagePriority.GREEN;
  }

  /**
   * Records vital signs, verifies active visit status, updates visit priority, publishes events, and manages Redis cache
   */
  async create(
    recordedById: string,
    input: CreateVitalSignsInput,
  ): Promise<VitalSigns> {
    // 1. Parallel verification for active visit, visit status, and duplicate vitals
    const [visit, existingVitals] = await Promise.all([
      prisma.patientVisit.findUnique({
        where: { id: input.visitId },
        select: { id: true, patientId: true, status: true },
      }),
      prisma.vitalSigns.findUnique({
        where: { visitId: input.visitId },
      }),
    ]);

    if (!visit) {
      throw new NotFoundError(`PATIENT_VISIT_NOT_FOUND: ${input.visitId}`);
    }

    // STRICT CHECK: Ensure vital signs can only be recorded if the patient visit is IN_PROGRESS
    if (visit.status !== VisitStatus.IN_PROGRESS) {
      throw new BadRequestError(
        `CANNOT_RECORD_VITALS: Visit is not active (Current status: ${visit.status}). Vital signs can only be recorded for visits with status IN_PROGRESS.`,
      );
    }

    if (existingVitals) {
      throw new ConflictError(`VITAL_SIGNS_ALREADY_EXISTS: ${input.visitId}`);
    }

    const computedBmi = this.calculateBMI(input.weight, input.height);
    const assignedPriority = this.evaluateTriagePriority(input);

    // 2. Transactional Database Persistence
    const vitals = await prisma.$transaction(async (tx) => {
      const createdVitals = await tx.vitalSigns.create({
        data: {
          visitId: input.visitId,
          temperature:
            input.temperature !== undefined
              ? new Prisma.Decimal(input.temperature)
              : undefined,
          systolicBP: input.systolicBP,
          diastolicBP: input.diastolicBP,
          pulseRate: input.pulseRate,
          respiratoryRate: input.respiratoryRate,
          spo2: input.spo2,
          weight: new Prisma.Decimal(input.weight),
          height:
            input.height !== undefined
              ? new Prisma.Decimal(input.height)
              : undefined,
          bmi: new Prisma.Decimal(computedBmi),
          priority: assignedPriority,
          notes: input.notes,
          recordedById,
        },
      });

      // Synchronize triage priority on patient visit
      await tx.patientVisit.update({
        where: { id: input.visitId },
        data: { triagePriority: assignedPriority },
      });

      return createdVitals;
    });

    // 3. Publish RabbitMQ asynchronous events
    const eventPayload = {
      vitalSignsId: vitals.id,
      visitId: vitals.visitId,
      patientId: visit.patientId,
      recordedById,
      priority: assignedPriority,
      spo2: input.spo2 ?? 0, // Fallback or ensure it matches the expected type
      systolicBP: input.systolicBP ?? 0,
      diastolicBP: input.diastolicBP ?? 0,
      pulseRate: input.pulseRate ?? 0,
      timestamp: vitals.createdAt.toISOString(),
    };
    await Promise.all([
      publishVitalSignsRecordedEvent(eventPayload),
      publishRealtimeAlertEvent(eventPayload),
    ]);

    // 4. Redis Cache Management (Cache Vitals & Invalidate parent Visit Caches)
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await Promise.all([
        redisClient.setex(
          `vitals:visit:${input.visitId}`,
          VITAL_SIGNS_CACHE_TTL,
          JSON.stringify(vitals),
        ),
        redisClient.del(`visit:${input.visitId}`),
        redisClient.del(`patient:${visit.patientId}:visits`),
      ]);
    }

    return vitals;
  }

  /**
   * Retrieves vital signs for a visit with Redis caching
   */
  async findByVisitId(visitId: string): Promise<VitalSigns> {
    const cacheKey = `vitals:visit:${visitId}`;

    if (redisClient.status === "ready" || redisClient.status === "connect") {
      const cachedVitals = await redisClient.get(cacheKey);
      if (cachedVitals) {
        return JSON.parse(cachedVitals);
      }
    }

    const vitals = await prisma.vitalSigns.findUnique({
      where: { visitId },
      include: {
        recordedBy: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    if (!vitals) {
      throw new NotFoundError(`VITAL_SIGNS_NOT_FOUND: ${visitId}`);
    }

    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await redisClient.setex(
        cacheKey,
        VITAL_SIGNS_CACHE_TTL,
        JSON.stringify(vitals),
      );
    }

    return vitals;
  }

  /**
   * Updates vital signs record, recalculates priority, and flushes cache
   */
  async update(id: string, input: UpdateVitalSignsInput): Promise<VitalSigns> {
    const currentVitals = await prisma.vitalSigns.findUnique({
      where: { id },
      include: { visit: { select: { patientId: true, status: true } } },
    });

    if (!currentVitals) {
      throw new NotFoundError(`VITAL_SIGNS_RECORD_NOT_FOUND: ${id}`);
    }

    if (currentVitals.visit.status !== VisitStatus.IN_PROGRESS) {
      throw new BadRequestError(
        `CANNOT_UPDATE_VITALS: Associated visit is no longer active (Status: ${currentVitals.visit.status}).`,
      );
    }

    const weight = input.weight ?? Number(currentVitals.weight);
    const height = input.height ?? Number(currentVitals.height);
    const computedBmi = this.calculateBMI(weight, height);

    const mergedInput = {
      systolicBP:
        input.systolicBP ??
        (currentVitals.systolicBP
          ? Number(currentVitals.systolicBP)
          : undefined),
      pulseRate:
        input.pulseRate ??
        (currentVitals.pulseRate ? Number(currentVitals.pulseRate) : undefined),
      spo2:
        input.spo2 ??
        (currentVitals.spo2 ? Number(currentVitals.spo2) : undefined),
      priority: input.priority,
    };
    const newPriority = this.evaluateTriagePriority(mergedInput);

    const updatedVitals = await prisma.$transaction(async (tx) => {
      const vitals = await tx.vitalSigns.update({
        where: { id },
        data: {
          ...(input.temperature !== undefined && {
            temperature: new Prisma.Decimal(input.temperature),
          }),
          ...(input.systolicBP !== undefined && {
            systolicBP: input.systolicBP,
          }),
          ...(input.diastolicBP !== undefined && {
            diastolicBP: input.diastolicBP,
          }),
          ...(input.pulseRate !== undefined && { pulseRate: input.pulseRate }),
          ...(input.respiratoryRate !== undefined && {
            respiratoryRate: input.respiratoryRate,
          }),
          ...(input.spo2 !== undefined && { spo2: input.spo2 }),
          ...(input.weight !== undefined && {
            weight: new Prisma.Decimal(input.weight),
          }),
          ...(input.height !== undefined && {
            height: new Prisma.Decimal(input.height),
          }),
          bmi: new Prisma.Decimal(computedBmi),
          priority: newPriority,
          ...(input.notes !== undefined && { notes: input.notes }),
        },
      });

      await tx.patientVisit.update({
        where: { id: currentVitals.visitId },
        data: { triagePriority: newPriority },
      });

      return vitals;
    });

    // Publish update event
    await publishVitalSignsUpdatedEvent({
      vitalSignsId: updatedVitals.id,
      visitId: updatedVitals.visitId,
      priority: newPriority,
    });

    // Invalidate cached records
    if (redisClient.status === "ready" || redisClient.status === "connect") {
      await Promise.all([
        redisClient.del(`vitals:visit:${updatedVitals.visitId}`),
        redisClient.del(`visit:${updatedVitals.visitId}`),
        redisClient.del(`patient:${currentVitals.visit.patientId}:visits`),
      ]);
    }

    return updatedVitals;
  }

  /**
   * Retrieves paginated list of vital signs with optional filters
   */
  async findMany(query: VitalSignsQueryInput) {
    const {
      page = 1,
      limit = 20,
      patientId,
      priority,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.VitalSignsWhereInput = {
      ...(priority && { priority }),
      ...(patientId && { visit: { patientId } }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    };

    const [total, records] = await Promise.all([
      prisma.vitalSigns.count({ where }),
      prisma.vitalSigns.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          visit: {
            select: {
              id: true,
              patientId: true,
              status: true,
              createdAt: true,
            },
          },
          recordedBy: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
        },
      }),
    ]);

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
