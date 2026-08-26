import { api } from "./../axiosClient";

export type VisitType = "OPD" | "IPD" | "EMERGENCY" | "REFERRAL";
export type VisitPriority = "NORMAL" | "URGENT" | "CRITICAL";
export type VisitStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"; // Added VisitStatus type

export interface Visit {
  id: string;
  patientId: string;
  facilityId: string;
  attendingId: string;
  visitType: VisitType;
  priority: VisitPriority;
  status: VisitStatus; // Added status property
  symptoms?: string | null;
  diagnosis?: string | null;
  icdCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
  attending?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CheckInVisitDTO {
  patientId: string;
  visitType?: VisitType;
  priority?: VisitPriority;
  status?: VisitStatus; // Added status property
  symptoms?: string | null;
  diagnosis?: string | null;
  icdCode?: string | null;
  attendingId?: string;
  facilityId?: string;
}

export interface UpdateVisitDTO {
  visitType?: VisitType;
  priority?: VisitPriority;
  status?: VisitStatus; // Added status property
  symptoms?: string | null;
  diagnosis?: string | null;
  icdCode?: string | null;
}

export interface VisitResponse {
  success: boolean;
  message?: string;
  data: Visit;
}

export interface VisitListResponse {
  success: boolean;
  count?: number;
  data: Visit[];
}

export interface VitalSignsInput {
  visitId: string;
  temperature?: number;
  systolicBP?: number;
  diastolicBP?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  weight: number;
  height?: number;
  notes?: string;
}

export interface VitalSignsRecord {
  id: string;
  visitId: string;
  weight: string | number;
  height?: string | number | null;
  temperature?: string | number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  pulseRate?: number | null;
  respiratoryRate?: number | null;
  spo2?: number | null;
  bmi: string | number;
  priority: string;
  notes?: string | null;
  recordedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalSignsApiResponse {
  success: boolean;
  message?: string;
  data: VitalSignsRecord;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Check in / open a new patient visit
export const createVisitApi = async (data: CheckInVisitDTO): Promise<Visit> => {
  const response = await api.post<VisitResponse>("/visits", data);
  return response.data.data || response.data;
};

// Update an existing visit record by ID (e.g., updating diagnosis or status to COMPLETED)
export const updateVisitApi = async (
  id: string,
  data: UpdateVisitDTO,
): Promise<Visit> => {
  const response = await api.put<VisitResponse>(`/visits/${id}`, data);
  return response.data.data || response.data;
};

// Retrieve a single visit by visit ID
export const getVisitByIdApi = async (id: string): Promise<Visit> => {
  const response = await api.get<VisitResponse>(`/visits/${id}`);
  return response.data.data || response.data;
};

// Retrieve all visit records for a patient by MRN
export const getVisitsByMrnApi = async (mrn: string): Promise<Visit[]> => {
  const query = mrn.trim();
  const response = await api.get<VisitListResponse>(
    `/visits/patient/${encodeURIComponent(query)}`,
  );
  return response.data.data || [];
};

// Retrieve all visit records for a patient by ID
export const getVisitsByPatientIdApi = async (id: string): Promise<Visit[]> => {
  const response = await api.get<VisitListResponse>(`/visits/patient/${id}`);
  return response.data.data || [];
};

export const recordVitalSignsApi = async (
  data: VitalSignsInput,
): Promise<VitalSignsRecord> => {
  try {
    const response = await api.post<VitalSignsApiResponse>(
      "/vital-signs",
      data,
    );

    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }

    return response.data as unknown as VitalSignsRecord;
  } catch (error: unknown) {
    const err = error as ApiErrorResponse;
    const errorMessage =
      err.response?.data?.message ?? "Failed to record vital signs";
    throw new Error(errorMessage, { cause: error });
  }
};
