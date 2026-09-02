// src/api/inventory/phamarcy.ts
import { api } from "../axiosClient";

export interface PharmacyBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  costPrice?: number;
  expiryDate: string;
}

export interface PrescriptionBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
}

export interface PrescriptionProduct {
  id: string;
  name: string;
  unitPrice: number;
  batches?: PrescriptionBatch[];
}

export interface PrescriptionItem {
  id: string;
  productId: string;
  quantity: number;
  dosage?: string;
  duration?: string;
  product: PrescriptionProduct;
}

export interface Patient {
  mrn: string;
  firstName: string;
  lastName: string;
  gender: string;
}

export interface PatientVisit {
  id: string;
  facilityId: string;
  patient?: Patient;
}

export interface Prescription {
  id: string;
  notes?: string;
  visit?: PatientVisit;
  items: PrescriptionItem[];
}

export interface DispenseFormItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  batchId: string;
  maxQty: number;
  batches: PrescriptionBatch[];
}

export interface Product {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category: string;
  unitPrice: number;
  reorderLevel: number;
  batches?: PharmacyBatch[];
}

export interface CreateProductDTO {
  name: string;
  code?: string;
  description?: string;
  category: "MEDICINE" | "EQUIPMENT" | "CONSUMABLE" | "SUPPLEMENT";
  unitPrice: number;
  reorderLevel: number;
}

export interface CreateBatchDTO {
  productId: string;
  batchNumber: string;
  quantity: number;
  costPrice?: number;
  expiryDate: string;
}

export interface DispenseItemDTO {
  productId: string;
  quantity: number;
  unitPrice: number;
  batchId: string;
}

export interface CreateDispenseRecordDTO {
  facilityId?: string;
  visitId?: string;
  prescriptionId?: string;
  dispensedById?: string;
  notes?: string;
  items: DispenseItemDTO[];
}

export const getPharmacyProductsApi = async (): Promise<Product[]> => {
  const response = await api.get<{ data: Product[] } | Product[]>(
    "/pharmacy/products",
  );
  return Array.isArray(response.data) ? response.data : response.data.data;
};

export const createPharmacyProductApi = async (
  dto: CreateProductDTO,
): Promise<Product> => {
  const response = await api.post<{ data: Product } | Product>(
    "/pharmacy/products",
    dto,
  );
  return "data" in response.data ? response.data.data : response.data;
};

export const updatePharmacyProductApi = async (
  id: string,
  dto: Partial<CreateProductDTO>,
): Promise<Product> => {
  const response = await api.put<{ data: Product } | Product>(
    `/pharmacy/products/${id}`,
    dto,
  );
  return "data" in response.data ? response.data.data : response.data;
};

export const createPharmacyBatchApi = async (
  dto: CreateBatchDTO,
): Promise<PharmacyBatch> => {
  const response = await api.post<{ data: PharmacyBatch } | PharmacyBatch>(
    "/pharmacy/batches",
    dto,
  );
  return "data" in response.data ? response.data.data : response.data;
};

export const getPendingPrescriptionsApi = async (
  facilityId?: string,
): Promise<Prescription[]> => {
  const url = facilityId
    ? `/pharmacy/dispense/prescriptions?facilityId=${facilityId}`
    : "/pharmacy/dispense/prescriptions";
  const response = await api.get<{ data: Prescription[] } | Prescription[]>(
    url,
  );
  return Array.isArray(response.data) ? response.data : response.data.data;
};

export const getPrescriptionsByMrnApi = async (
  mrn: string,
  facilityId?: string,
): Promise<Prescription[]> => {
  const url = facilityId
    ? `/pharmacy/dispense/prescriptions/mrn/${encodeURIComponent(mrn)}?facilityId=${facilityId}`
    : `/pharmacy/dispense/prescriptions/mrn/${encodeURIComponent(mrn)}`;
  const response = await api.get<{ data: Prescription[] } | Prescription[]>(
    url,
  );
  return Array.isArray(response.data) ? response.data : response.data.data;
};

export const getPrescriptionByIdApi = async (
  prescriptionId: string,
): Promise<Prescription> => {
  const response = await api.get<{ data: Prescription } | Prescription>(
    `/pharmacy/dispense/prescription/${prescriptionId}`,
  );
  return "data" in response.data ? response.data.data : response.data;
};

export const createDispenseRecordApi = async (
  dto: CreateDispenseRecordDTO,
): Promise<unknown> => {
  const response = await api.post("/pharmacy/dispense", dto);
  return response.data;
};
