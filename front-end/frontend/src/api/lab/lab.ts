// api/lab/lab.ts
import { api } from "../axiosClient";

export interface LabResultItem {
  id: string;
  providedServiceId: string;
  visitId: string;
  specimenType?: string;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  status: "ORDERED" | "COMPLETED" | "VERIFIED";
  findings?: string;
  performedById?: string;
  verifiedById?: string;
  createdAt: string;
  updatedAt: string;
  providedService?: {
    id: string;
    unitPrice: number | string;
    notes?: string;
    service?: {
      id: string;
      name: string;
      category: string;
      price: number | string;
    };
  };
  visit?: {
    id: string;
    status: string;
    createdAt: string;
  };
  performedBy?: {
    id: string;
    name: string;
    email: string;
  };
  verifiedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RecordLabResultDTO {
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  findings?: string;
  specimenType?: string;
  status?: "ORDERED" | "COMPLETED" | "VERIFIED";
}

export interface VerifyLabResultDTO {
  findings?: string;
}

// 1. Fetch lab results and orders for a patient using their MRN
export const getLabResultsByMrnApi = async (
  mrn: string,
): Promise<LabResultItem[]> => {
  const response = await api.get<LabResultItem[] | { data: LabResultItem[] }>(
    `/labs/patient/mrn/${mrn}`,
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data || [];
};

// 2. Fetch lab results for a specific patient visit
export const getLabResultsByVisitApi = async (
  visitId: string,
): Promise<LabResultItem[]> => {
  const response = await api.get<LabResultItem[] | { data: LabResultItem[] }>(
    `/labs/visit/${visitId}`,
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data || [];
};

// 3. Record test results, findings, and mark as completed
export const recordLabResultApi = async (
  labResultId: string,
  data: RecordLabResultDTO,
): Promise<LabResultItem> => {
  const response = await api.put(`/labs/${labResultId}/results`, data);
  return response.data.data || response.data;
};

// 4. Verify and approve lab results (Senior Technician / Doctor)
export const verifyLabResultApi = async (
  labResultId: string,
  data: VerifyLabResultDTO,
): Promise<LabResultItem> => {
  const response = await api.put(`/labs/${labResultId}/verify`, data);
  return response.data.data || response.data;
};
