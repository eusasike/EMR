// src/service/billing/insurance.service.ts

import { PrismaClient, ClaimStatus } from "@prisma/client";
import { redisClient } from "../../config/redis";
import { ClaimsPublisher } from "../../message/publisher/insuarance.publisher";
import {
  CreatePatientInsuranceDTO,
  CreateInsuranceClaimDTO,
  ProcessInsuranceClaimDTO,
} from "../../models/billing/insuarance.model";

const prisma = new PrismaClient();
const REDIS_TTL = 3600; // Cache for 1 hour

export class InsuranceService {
  /**
   * Register a new Patient Insurance Policy
   */
  public async registerInsurance(dto: CreatePatientInsuranceDTO) {
    const insurance = await prisma.patientInsurance.create({
      data: {
        patientId: dto.patientId,
        providerName: dto.providerName,
        policyNumber: dto.policyNumber,
        cardNumber: dto.cardNumber,
        principalName: dto.principalName,
        relationship: dto.relationship ?? "SELF",
        coverageLimit: dto.coverageLimit ? dto.coverageLimit : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });

    // Invalidate cached insurance list for this patient
    await redisClient.del(`patient:insurance:${dto.patientId}`);

    return insurance;
  }

  /**
   * Get Active Insurance Policies for a Patient (with Redis Caching)
   */
  public async getPatientInsurances(patientId: string) {
    const cacheKey = `patient:insurance:${patientId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const insurances = await prisma.patientInsurance.findMany({
      where: { patientId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    if (insurances.length > 0) {
      await redisClient.setex(cacheKey, REDIS_TTL, JSON.stringify(insurances));
    }

    return insurances;
  }

  /**
   * Submit an Insurance Claim & Publish Event via ClaimsPublisher
   */
  public async createClaim(dto: CreateInsuranceClaimDTO) {
    const claimNumber = `CLM-${Date.now()}`;

    const claim = await prisma.insuranceClaim.create({
      data: {
        claimNumber,
        visitId: dto.visitId,
        invoiceId: dto.invoiceId ?? null,
        patientInsuranceId: dto.patientInsuranceId,
        requestedAmount: dto.requestedAmount,
        preAuthCode: dto.preAuthCode ?? null,
        notes: dto.notes ?? null,
        submittedAt: new Date(),
        status: ClaimStatus.PENDING_PRE_AUTH,
      },
      include: {
        patientInsurance: true,
      },
    });

    // Delegate event publishing to the publisher
    await ClaimsPublisher.publishClaimCreated({
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      visitId: claim.visitId,
      invoiceId: claim.invoiceId,
      requestedAmount: Number(claim.requestedAmount),
      patientInsuranceId: claim.patientInsuranceId,
      timestamp: new Date().toISOString(),
    });

    return claim;
  }

  /**
   * Process/Approve Claim and update Invoice & Publish Event via ClaimsPublisher
   */
  public async processClaim(claimId: string, dto: ProcessInsuranceClaimDTO) {
    const updatedClaim = await prisma.$transaction(async (tx) => {
      const claim = await tx.insuranceClaim.update({
        where: { id: claimId },
        data: {
          approvedAmount: dto.approvedAmount,
          coPayAmount: dto.coPayAmount,
          status: dto.status as ClaimStatus,
          rejectionReason: dto.rejectionReason ?? null,
          notes: dto.notes ?? null,
          processedAt: new Date(),
        },
      });

      // If claim is linked to an invoice, adjust invoice totals
      if (claim.invoiceId) {
        await tx.invoice.update({
          where: { id: claim.invoiceId },
          data: {
            amountPaid: { increment: dto.approvedAmount },
          },
        });
      }

      return claim;
    });

    // Delegate event publishing to the publisher
    await ClaimsPublisher.publishClaimProcessed({
      claimId: updatedClaim.id,
      status: updatedClaim.status,
      approvedAmount: Number(updatedClaim.approvedAmount),
      coPayAmount: Number(updatedClaim.coPayAmount),
      invoiceId: updatedClaim.invoiceId,
      timestamp: new Date().toISOString(),
    });

    return updatedClaim;
  }
}
