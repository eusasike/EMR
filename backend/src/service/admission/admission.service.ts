import { PrismaClient, BedStatus, AdmissionStatus } from "@prisma/client";
import { redisClient } from "../../config/redis";
import { AdmissionPublisher } from "../../message/publisher/admission.publisher";
import {
  CreateWardDTO,
  CreateBedDTO,
  AdmitPatientDTO,
  DischargePatientDTO,
} from "../../models/admission/admission.model";

const prisma = new PrismaClient();
const REDIS_TTL = 3600; // Cache for 1 hour

export class AdmissionService {
  /**
   * Create a new Ward
   */
  public async createWard(dto: CreateWardDTO) {
    const ward = await prisma.ward.create({
      data: {
        name: dto.name,
        code: dto.code ?? null,
        type: dto.type ?? "GENERAL",
        capacity: dto.capacity ?? 10,
        dailyRate: dto.dailyRate,
        description: dto.description ?? null,
      },
    });

    await redisClient.del("wards:all");
    return ward;
  }

  /**
   * Get all Wards with Redis caching
   */
  public async getAllWards() {
    const cacheKey = "wards:all";
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const wards = await prisma.ward.findMany({
      include: {
        beds: true,
      },
      orderBy: { name: "asc" },
    });

    if (wards.length > 0) {
      await redisClient.setex(cacheKey, REDIS_TTL, JSON.stringify(wards));
    }

    return wards;
  }

  /**
   * Add a Bed to a Ward
   */
  public async createBed(dto: CreateBedDTO) {
    const bed = await prisma.bed.create({
      data: {
        wardId: dto.wardId,
        bedNumber: dto.bedNumber,
        status: BedStatus.AVAILABLE,
      },
    });

    await redisClient.del(`ward:${dto.wardId}:beds`);
    await redisClient.del("wards:all");
    return bed;
  }

  /**
   * Admit Patient & Occupy Bed
   */
  public async admitPatient(dto: AdmitPatientDTO) {
    const admissionNumber = `ADM-${Date.now()}`;

    const admission = await prisma.$transaction(async (tx) => {
      // 1. Verify Bed is available
      const bed = await tx.bed.findUnique({
        where: { id: dto.bedId },
        include: { ward: true },
      });

      if (!bed || bed.status !== BedStatus.AVAILABLE) {
        throw new Error("Bed is not available for admission.");
      }

      // 2. Mark Bed as OCCUPIED
      await tx.bed.update({
        where: { id: dto.bedId },
        data: { status: BedStatus.OCCUPIED },
      });

      // 3. Create Admission Record
      const record = await tx.admissionRecord.create({
        data: {
          admissionNumber,
          visitId: dto.visitId,
          patientId: dto.patientId,
          bedId: dto.bedId,
          admittedById: dto.admittedById,
          admissionNotes: dto.admissionNotes ?? null,
          status: AdmissionStatus.ADMITTED,
        },
        include: {
          bed: {
            include: { ward: true },
          },
        },
      });

      return record;
    });

    // Invalidate caches
    await redisClient.del(`ward:${admission.bedId}:beds`);
    await redisClient.del("wards:all");

    // Publish event via AdmissionPublisher
    await AdmissionPublisher.publishPatientAdmitted({
      admissionId: admission.id,
      admissionNumber: admission.admissionNumber,
      visitId: admission.visitId,
      patientId: admission.patientId,
      bedId: admission.bedId,
      wardId: admission.wardId,
      dailyRate: Number(admission.bed.ward.dailyRate),
      admittedAt: admission.admittedAt.toISOString(),
    });

    return admission;
  }

  /**
   * Discharge Patient & Release Bed
   */
  public async dischargePatient(admissionId: string, dto: DischargePatientDTO) {
    const dischargedAt = new Date();

    const admission = await prisma.$transaction(async (tx) => {
      const record = await tx.admissionRecord.findUnique({
        where: { id: admissionId },
        include: { bed: true },
      });

      if (!record || record.status !== AdmissionStatus.ADMITTED) {
        throw new Error("Active admission record not found.");
      }

      // 1. Update Admission Record
      const updatedRecord = await tx.admissionRecord.update({
        where: { id: admissionId },
        data: {
          dischargedById: dto.dischargedById,
          dischargeNotes: dto.dischargeNotes ?? null,
          dischargedAt,
          status: AdmissionStatus.DISCHARGED,
        },
      });

      // 2. Mark Bed as AVAILABLE
      await tx.bed.update({
        where: { id: record.bedId },
        data: { status: BedStatus.AVAILABLE },
      });

      return updatedRecord;
    });

    // Calculate duration in days (minimum 1 day)
    const timeDiff =
      dischargedAt.getTime() - new Date(admission.admittedAt).getTime();
    const totalDays = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    // Invalidate caches
    await redisClient.del(`ward:${admission.bedId}:beds`);
    await redisClient.del("wards:all");

    // Publish discharge event for Billing consumer
    await AdmissionPublisher.publishPatientDischarged({
      admissionId: admission.id,
      admissionNumber: admission.admissionNumber,
      visitId: admission.visitId,
      patientId: admission.patientId,
      bedId: admission.bedId,
      dischargedAt: dischargedAt.toISOString(),
      totalDays,
    });

    return admission;
  }
}
