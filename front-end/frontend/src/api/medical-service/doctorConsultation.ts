import type { ProvidedServiceItem } from "./medical-service";

export interface LabResultItem {
  id: string;
  status: string;
  specimenType?: string;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  findings?: string;
}

export interface ExtendedProvidedServiceItem extends ProvidedServiceItem {
  labResult?: LabResultItem;
}

export interface PrescriptionBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate?: string;
}

export interface PharmacyProduct {
  id: string;
  name: string;
  unitPrice: number | string;
  batches?: PrescriptionBatch[];
}

export interface PharmacyPrescriptionItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  dosage: string;
  duration: string;
  selected: boolean;
  batches: PrescriptionBatch[];
}

export interface PrescriptionSummaryItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  dosage?: string;
  duration?: string;
}

export interface PrescriptionSummary {
  id: string;
  notes?: string;
  items: PrescriptionSummaryItem[];
}
