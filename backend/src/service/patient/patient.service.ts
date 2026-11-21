import { Patient, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
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

export class PatientService {
  /**
   * Registers a patient with facility-scoped MRN generation,
   * DB persistence, and RabbitMQ event publication.
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
        // Pass (attempt - 1) as offset so concurrent requests step forward on retry
        const mrn = await this.generateFacilityMRN(facilityId, attempt - 1);

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
            `⚠️ [MRN Collision] Facility ${facilityId} hit MRN collision on attempt ${attempt}/${maxRetries}. Retrying...`,
          );

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
   * Generates facility-scoped MRN directly from PostgreSQL max sequence.
   */
  private async generateFacilityMRN(
    facilityId: string,
    offset = 0,
  ): Promise<string> {
    const year = new Date().getFullYear();

    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { code: true },
    });

    const facilityCode = facility?.code ? facility.code.toUpperCase() : "GEN";

    // Extract the trailing digits after the last hyphen (handles hyphenated facility codes)
    const result = await prisma.$queryRaw<{ max_seq: number | null }[]>`
      SELECT MAX(CAST(SUBSTRING(mrn FROM '([0-9]+)$') AS INTEGER)) as max_seq
      FROM patients
      WHERE facility_id = ${facilityId}
        AND mrn LIKE ${`MRN-${year}-${facilityCode}-%`}
    `;

    const lastSeq = Number(result[0]?.max_seq ?? 0);
    const nextSeq = lastSeq + 1 + offset;

    return `MRN-${year}-${facilityCode}-${String(nextSeq).padStart(6, "0")}`;
  }

  /**
   * Fetch Patient by ID directly from PostgreSQL
   */
  async getPatientById(id: string): Promise<Patient | null> {
    return await prisma.patient.findUnique({
      where: { id },
      include: {
        region: true,
        district: true,
      },
    });
  }

  /**
   * Update Patient directly in PostgreSQL
   */
  async updatePatient(id: string, data: UpdatePatientDTO): Promise<Patient> {
    return await prisma.patient.update({
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
  }

  /**
   * Search patients constrained to requestor facilityId
   */
  async searchPatients(params: PatientSearchParams): Promise<Patient[]> {
    const { mrn, firstName, lastName, facilityId } = params;

    return await prisma.patient.findMany({
      where: {
        facilityId,
        ...(mrn && {
          mrn: { contains: mrn.trim(), mode: "insensitive" },
        }),
        ...(firstName && {
          firstName: { contains: firstName.trim(), mode: "insensitive" },
        }),
        ...(lastName && {
          lastName: { contains: lastName.trim(), mode: "insensitive" },
        }),
      },
      include: {
        region: true,
        district: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  /**
   * Get paginated list of patients for a facility
   */
  /**
   * Get paginated list of patients for a facility
   */
  async getPatients(
    query: PatientQueryDTO,
    facilityId: string,
  ): Promise<PaginatedResponse<Patient>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const where: Prisma.PatientWhereInput = {
      facilityId,
      ...(query.gender && { gender: query.gender }),
      ...(query.search && {
        OR: [
          { mrn: { contains: query.search.trim(), mode: "insensitive" } },
          { firstName: { contains: query.search.trim(), mode: "insensitive" } },
          { lastName: { contains: query.search.trim(), mode: "insensitive" } },
          { phone: { contains: query.search.trim(), mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          region: true,
          district: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.patient.count({ where }),
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
