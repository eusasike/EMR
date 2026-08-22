// src/dtos/insurance.dto.ts

export interface CreatePatientInsuranceDTO {
  patientId: string;
  providerName: string;
  policyNumber: string;
  cardNumber: string;
  principalName?: string;
  relationship?: string;
  coverageLimit?: number;
  expiryDate?: string;
}

export interface CreateInsuranceClaimDTO {
  visitId: string;
  invoiceId?: string;
  patientInsuranceId: string;
  requestedAmount: number;
  preAuthCode?: string;
  notes?: string;
}

export interface ProcessInsuranceClaimDTO {
  approvedAmount: number;
  coPayAmount: number;
  status: "APPROVED" | "REJECTED" | "PARTIALLY_APPROVED";
  rejectionReason?: string;
  notes?: string;
}

export interface InsuranceClaimResponseDTO {
  id: string;
  claimNumber: string;
  visitId: string;
  invoiceId: string | null;
  patientInsuranceId: string;
  preAuthCode: string | null;
  requestedAmount: number;
  approvedAmount: number;
  coPayAmount: number;
  status: string;
  rejectionReason: string | null;
  notes: string | null;
  submittedAt: Date | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
