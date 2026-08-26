import { Patient, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { redisClient } from "../../config/redis";
import {
  RegisterPatientDTO,
  PatientQueryDTO,
  UpdatePatientDTO,
} from "../../models/patient/patient.model";
import { publishPatientRegisteredEvent } from "../../message/publisher/patient.publisher";
import { PaginatedResponse } from "../../util/apiResponse";

export interface PatientSearchParams {
  mrn?: string;
  firstName?: string;
  lastName?: string;
  facilityId: string;
}

const PATIENT_CACHE_TTL = 3600; // 1 hour in seconds
const getPatientCacheKey = (id: string) => `patient:${id}`;

export class PatientService {
  /**
   * Registers a patient with facility-scoped MRN generation,
   * DB persistence, non-blocking caching, and RabbitMQ event publication.
   */
  async registerPatient(
    input: RegisterPatientDTO,
    attendingUserId: string,
    facilityId: string,
    maxRetries = 3,
  ): Promise<Patient> {
    let patient: Patient | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const mrn = await this.generateFacilityMRNWithRedis(facilityId);

        patient = await prisma.$transaction(async (tx) => {
          return await tx.patient.create({
            data: {
              mrn,
              facilityId,
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
              regionId: input.regionId || null,
              districtId: input.districtId || null,
            },
            include: {
              region: true,
              district: true,
            },
          });
        });

        break;
      } catch (error) {
        const isDuplicateMrn =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          (error.meta?.target as string[])?.includes("mrn");

        if (isDuplicateMrn) {
          console.warn(
            `⚠️ [MRN Collision] Facility ${facilityId} hit MRN collision on attempt ${attempt}/${maxRetries}. Invalidating sequence...`,
          );

          const year = new Date().getFullYear();
          const sequenceKey = `mrn:sequence:${facilityId}:${year}`;
          await redisClient.del(sequenceKey).catch(() => {});

          if (attempt === maxRetries) {
            throw new Error(
              "Failed to register patient: MRN generation retry limit reached.",
            );
          }
        } else {
          throw error;
        }
      }
    }

    if (!patient) {
      throw new Error("Patient registration failed.");
    }

    // Cache by Primary Key and MRN
    try {
      await Promise.all([
        redisClient.set(
          getPatientCacheKey(patient.id),
          JSON.stringify(patient),
          "EX",
          PATIENT_CACHE_TTL,
        ),
        redisClient.set(
          `patient:facility:${facilityId}:mrn:${patient.mrn}`,
          JSON.stringify(patient),
          "EX",
          86400,
        ),
      ]);
    } catch (cacheError: any) {
      console.error(
        `⚠️ [Redis Cache Error] Failed to cache patient ${patient.id}:`,
        cacheError.message,
      );
    }

    // Publish Event
    try {
      await publishPatientRegisteredEvent({
        patientId: patient.id,
        mrn: patient.mrn,
        facilityId: patient.facilityId,
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
   * Generates facility-scoped atomic MRN using Redis INCR with DB max sequence fallback seeding.
   */
  private async generateFacilityMRNWithRedis(
    facilityId: string,
  ): Promise<string> {
    const year = new Date().getFullYear();

    // 1. Fetch the facility code from your database using facilityId
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { code: true }, // Ensure your facility model has a 'code' field (e.g., 'DAR', 'MOH')
    });

    const facilityCode = facility?.code ? facility.code.toUpperCase() : "GEN";

    // 2. Include facilityCode in the Redis sequence key so counters are per facility
    const sequenceKey = `mrn:sequence:${facilityId}:${year}`;

    const exists = await redisClient.exists(sequenceKey);
    if (!exists) {
      // 3. Optional: Adjust query if your MRN structure changes (e.g., splitting at index 3 or 4)
      const result = await prisma.$queryRaw<{ max_seq: number | null }[]>`
        SELECT MAX(CAST(SPLIT_PART(mrn, '-', 4) AS INTEGER)) as max_seq
        FROM patients
        WHERE facility_id = ${facilityId}
          AND mrn LIKE ${`MRN-${year}-${facilityCode}-%`}
      `;

      const lastSeq = result[0]?.max_seq ?? 0;
      await redisClient.setnx(sequenceKey, lastSeq);
    }

    const seq = await redisClient.incr(sequenceKey);

    // 4. Return MRN format containing the facility code
    return `MRN-${year}-${facilityCode}-${String(seq).padStart(6, "0")}`;
  }

  /**
   * Fetch Patient by ID with Cache-Aside Pattern
   */
  async getPatientById(id: string): Promise<Patient | null> {
    const cacheKey = getPatientCacheKey(id);

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const parsed: Patient = JSON.parse(cachedData);
        return {
          ...parsed,
          dateOfBirth: new Date(parsed.dateOfBirth),
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        };
      }
    } catch (err: any) {
      console.warn(`⚠️ [Redis Error] Bypassing patient cache: ${err.message}`);
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        region: true,
        district: true,
      },
    });

    if (patient) {
      await redisClient
        .set(cacheKey, JSON.stringify(patient), "EX", PATIENT_CACHE_TTL)
        .catch(() => {});
    }

    return patient;
  }

  /**
   * Update Patient & Sync/Invalidate Caches
   */
  async updatePatient(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
      include: {
        region: true,
        district: true,
      },
    });

    // Sync primary ID cache
    const cacheKey = getPatientCacheKey(id);
    await redisClient
      .set(cacheKey, JSON.stringify(updatedPatient), "EX", PATIENT_CACHE_TTL)
      .catch(() => {});

    // Sync MRN cache if available
    if (updatedPatient.facilityId && updatedPatient.mrn) {
      await redisClient
        .set(
          `patient:facility:${updatedPatient.facilityId}:mrn:${updatedPatient.mrn}`,
          JSON.stringify(updatedPatient),
          "EX",
          86400,
        )
        .catch(() => {});
    }

    return updatedPatient;
  }

  /**
   * Search patients constrained to requestor facilityId.
   */
  async searchPatients(params: PatientSearchParams): Promise<Patient[]> {
    const { mrn, firstName, lastName, facilityId } = params;

    const cacheIdentifier = [
      `fac:${facilityId}`,
      mrn ? `mrn:${mrn.trim()}` : null,
      firstName ? `fn:${firstName.toLowerCase().trim()}` : null,
      lastName ? `ln:${lastName.toLowerCase().trim()}` : null,
    ]
      .filter(Boolean)
      .join(":");

    const cacheKey = `patient:search:${cacheIdentifier}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const parsedArray: Patient[] = JSON.parse(cachedData);
        return parsedArray.map((patient) => ({
          ...patient,
          dateOfBirth: new Date(patient.dateOfBirth),
          createdAt: new Date(patient.createdAt),
          updatedAt: new Date(patient.updatedAt),
        }));
      }
    } catch (error: any) {
      console.warn(`⚠️ [Redis Error] Bypassing search cache: ${error.message}`);
    }

    const where: Prisma.PatientWhereInput = { facilityId };

    if (mrn) where.mrn = mrn.trim();
    if (firstName)
      where.firstName = { equals: firstName.trim(), mode: "insensitive" };
    if (lastName)
      where.lastName = { equals: lastName.trim(), mode: "insensitive" };

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        region: true,
        district: true,
      },
    });

    if (patients.length > 0) {
      await redisClient
        .set(cacheKey, JSON.stringify(patients), "EX", 3600)
        .catch(() => {});
    }

    return patients;
  }

  /**
   * Paginated retrieval constrained by facility context.
   */
  async getPatients(
    query: PatientQueryDTO,
    facilityId: string,
  ): Promise<PaginatedResponse<Patient>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = { facilityId };

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
        include: {
          region: true,
          district: true,
        },
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
}
