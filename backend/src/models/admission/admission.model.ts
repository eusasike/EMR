// src/models/admission/admission.model.ts

import { WardType, BedStatus, AdmissionStatus } from "@prisma/client";

export interface CreateWardDTO {
  name: string;
  code?: string;
  type?: WardType;
  capacity?: number;
  dailyRate: number;
  description?: string;
}

export interface CreateBedDTO {
  wardId: string;
  bedNumber: string;
}

export interface AdmitPatientDTO {
  visitId: string;
  patientId: string;
  bedId: string;
  admittedById: string;
  admissionNotes?: string;
}

export interface DischargePatientDTO {
  dischargedById: string;
  dischargeNotes?: string;
}
