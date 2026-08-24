import { Patient, Prisma } from "@prisma/client";
import { prisma } from "../../config/database"; // Shared Prisma Singleton instance
import { redisClient } from "../../config/redis";
import {
  RegisterPatientDTO,
  PatientQueryDTO,
} from "../../models/patient/patient.model";
import { publishPatientRegisteredEvent } from "../../message/publisher/patient.publisher";
import { PaginatedResponse } from "../../util/apiResponse";

export interface PatientSearchParams {
  mrn?: string;
  firstName?: string;
  lastName?: string;
}
export class PatientService {
  /**
   * Registers a patient with atomic MRN generation, DB persistence,
   * resilient caching, and event broadcasting.
   */
  async registerPatient(
    input: RegisterPatientDTO,
    attendingUserId: string,
    maxRetries = 3,
  ): Promise<Patient> {
    let patient: Patient | null = null;

    // 1. Persist to PostgreSQL with MRN Collision Retry
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const mrn = await this.generateMRNWithRedis();

        patient = await prisma.$transaction(async (tx) => {
          // Create patient record
          const createdPatient = await tx.patient.create({
            data: {
              mrn,
              firstName: input.firstName.trim(),
              lastName: input.lastName.trim(),
              middleName: input.middleName?.trim() || null,
              gender: input.gender,
              dateOfBirth: new Date(input.dateOfBirth),
              phone: input.phone?.trim() || null,
              emergencyContactName: input.emergencyContactName?.trim() || null,
              emergencyContactPhone:
                input.emergencyContactPhone?.trim() || null,
              address: input.address?.trim() || null,
            },
          });

          return createdPatient;
        });

        // Break loop on successful insertion
        break;
      } catch (error) {
        // ✅ Corrected: Check against Prisma's static class constructor from namespace
        const isDuplicateMrn =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          (error.meta?.target as string[])?.includes("mrn");

        if (isDuplicateMrn) {
          console.warn(
            `⚠️ [MRN Collision] Duplicate MRN on attempt ${attempt}/${maxRetries}. Resyncing Redis sequence...`,
          );
          // Flush stale sequence key in Redis to force re-seeding from DB on next loop
          const year = new Date().getFullYear();
          await redisClient.del(`mrn:sequence:${year}`).catch(() => {});

          if (attempt === maxRetries) {
            throw new Error(
              "Failed to register patient: MRN generation collision limit reached.",
            );
          }
        } else {
          throw error; // Re-throw non-collision errors immediately
        }
      }
    }

    if (!patient) {
      throw new Error("Patient registration failed.");
    }

    // 2. Cache patient profile in Redis (Non-blocking)
    const cacheKey = `patient:mrn:${patient.mrn}`;
    try {
      await redisClient.set(cacheKey, JSON.stringify(patient), "EX", 86400);
    } catch (cacheError: any) {
      console.error(
        `⚠️ [Redis Cache Error] Failed to cache MRN ${patient.mrn}:`,
        cacheError.message,
      );
    }

    // 3. Publish RabbitMQ Event (Non-blocking)
    try {
      await publishPatientRegisteredEvent({
        patientId: patient.id,
        mrn: patient.mrn,
        fullName: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone,
      });
    } catch (mqError: any) {
      console.error(
        `⚠️ [RabbitMQ Error] Event publish failed for MRN ${patient.mrn}:`,
        mqError.message,
      );
    }

    return patient;
  }

  /**
   * Retrieves patient by MRN with Read-Through caching & date reconstruction.
   */
  async searchPatients(params: PatientSearchParams): Promise<Patient[]> {
    const { mrn, firstName, lastName } = params;

    // Build unique cache key identifier
    const cacheIdentifier = [
      mrn ? `mrn:${mrn.trim()}` : null,
      firstName ? `fn:${firstName.toLowerCase().trim()}` : null,
      lastName ? `ln:${lastName.toLowerCase().trim()}` : null,
    ]
      .filter(Boolean)
      .join(":");

    if (!cacheIdentifier) {
      return [];
    }

    const cacheKey = `patient:search_list:${cacheIdentifier}`;

    // 1. Check Redis Cache
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`⚡ [Redis Cache Hit] ${cacheKey}`);
        const parsedArray: Patient[] = JSON.parse(cachedData);

        // Reconstruct Date instances for all items in the array
        return parsedArray.map((patient) => ({
          ...patient,
          dateOfBirth: new Date(patient.dateOfBirth),
          createdAt: new Date(patient.createdAt),
          updatedAt: new Date(patient.updatedAt),
        }));
      }
    } catch (error: any) {
      console.warn(`⚠️ [Redis Error] Bypassing cache: ${error.message}`);
    }

    // 2. Build Prisma Dynamic Filter
    const where: Prisma.PatientWhereInput = {};

    if (mrn) {
      where.mrn = mrn.trim();
    }
    if (firstName) {
      where.firstName = { equals: firstName.trim(), mode: "insensitive" };
    }
    if (lastName) {
      where.lastName = { equals: lastName.trim(), mode: "insensitive" };
    }

    // 3. Database Query (returns all matching records, capped at 50)
    console.log(`🐢 [DB Query] Searching patients with criteria:`, where);
    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // 4. Cache Array in Redis
    if (patients.length > 0) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(patients), "EX", 3600);
      } catch (err) {
        // Suppress cache write errors
      }
    }

    return patients;
  }
  /**
   * Paginated search for patients by name, MRN, or phone number.
   */
  async getPatients(
    query: PatientQueryDTO,
  ): Promise<PaginatedResponse<Patient>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.gender) {
      where.gender = query.gender;
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { mrn: { contains: searchTerm, mode: "insensitive" } },
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Generates atomic MRN using Redis INCR with automatic DB fallback seeding.
   */
  private async generateMRNWithRedis(): Promise<string> {
    const year = new Date().getFullYear();
    const sequenceKey = `mrn:sequence:${year}`;

    const exists = await redisClient.exists(sequenceKey);
    if (!exists) {
      // Cast string sequence to integer in SQL to ensure accurate numeric ordering
      const result = await prisma.$queryRaw<{ max_seq: number | null }[]>`
      SELECT MAX(CAST(SPLIT_PART(mrn, '-', 3) AS INTEGER)) as max_seq
      FROM patients
      WHERE mrn LIKE ${`MRN-${year}-%`}
    `;

      const lastSeq = result[0]?.max_seq ?? 0;
      await redisClient.setnx(sequenceKey, lastSeq);
    }

    const seq = await redisClient.incr(sequenceKey);
    return `MRN-${year}-${String(seq).padStart(6, "0")}`;
  }
}
