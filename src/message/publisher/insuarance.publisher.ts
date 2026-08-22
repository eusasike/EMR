// src/events/publishers/claims.publisher.ts

import { publishToQueue } from "../../config/rabbitmq";

const EXCHANGE_NAME = "billing_exchange";

export interface ClaimCreatedPayload {
  claimId: string;
  claimNumber: string;
  visitId: string;
  invoiceId: string | null;
  requestedAmount: number;
  patientInsuranceId: string;
  timestamp: string;
}

export interface ClaimProcessedPayload {
  claimId: string;
  status: string;
  approvedAmount: number;
  coPayAmount: number;
  invoiceId: string | null;
  timestamp: string;
}

export class ClaimsPublisher {
  /**
   * Publish claim.created event
   */
  public static async publishClaimCreated(
    payload: ClaimCreatedPayload,
  ): Promise<boolean> {
    return await publishToQueue(EXCHANGE_NAME, "claim.created", payload);
  }

  /**
   * Publish claim.processed event
   */
  public static async publishClaimProcessed(
    payload: ClaimProcessedPayload,
  ): Promise<boolean> {
    return await publishToQueue(EXCHANGE_NAME, "claim.processed", payload);
  }
}
