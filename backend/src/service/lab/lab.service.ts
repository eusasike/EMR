import { LabStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import {
  OrderLabServiceDTO,
  RecordLabResultDTO,
} from "../../models/lab/lab.model";
import { LabPublisher } from "../../message/publisher/lab.publisher";
import { NotFoundError } from "../../util/custom-error";

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

    try {
      await LabPublisher.publishLabOrdered({
        labResultId: labResult.id,
        visitId: labResult.visitId,
        providedServiceId: labResult.providedServiceId,
        timestamp: labResult.createdAt.toISOString(),
      });
    } catch (mqError: any) {
      console.error(
        `⚠️ [RabbitMQ Error] Failed to publish lab ordered event:`,
        mqError.message,
      );
    }

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
      throw new NotFoundError("Lab result record not found.");
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
        performedById,
      },
      include: {
        performedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    try {
      await LabPublisher.publishLabCompleted({
        labResultId: updated.id,
        visitId: updated.visitId,
        performedById,
        timestamp: updated.updatedAt.toISOString(),
      });
    } catch (mqError: any) {
      console.error(
        `⚠️ [RabbitMQ Error] Failed to publish lab completed event:`,
        mqError.message,
      );
    }

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
        verifiedById,
        ...(findings ? { findings } : {}),
      },
      include: {
        verifiedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    try {
      await LabPublisher.publishLabVerified({
        labResultId: updated.id,
        visitId: updated.visitId,
        verifiedById,
        timestamp: updated.updatedAt.toISOString(),
      });
    } catch (mqError: any) {
      console.error(
        `⚠️ [RabbitMQ Error] Failed to publish lab verified event:`,
        mqError.message,
      );
    }

    return updated;
  }

  /**
   * Fetch lab results for a specific patient visit directly from PostgreSQL.
   */
  public async getResultsByVisit(visitId: string) {
    return await prisma.labResult.findMany({
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
  }

  /**
   * Fetch lab results and orders for a patient using their MRN
   */
  public async getLabResultsByMrn(mrn: string, facilityId?: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        mrn,
        ...(facilityId && { facilityId }),
      },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundError(`PATIENT_NOT_FOUND_FOR_MRN: ${mrn}`);
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
