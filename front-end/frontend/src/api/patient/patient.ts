import { api } from "./../axiosClient";

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  phone?: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  address?: string;
  regionId?: string | null;
  districtId?: string | null;
  createdAt?: string;
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  phone?: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  address?: string;
  regionId?: string | null;
  districtId?: string | null;
}

export interface PatientListResponse {
  success: boolean;
  data: Patient[];
}

export const getPatientsApi = async (): Promise<Patient[]> => {
  const response = await api.get<PatientListResponse>("/patients");
  return response.data.data || response.data;
};

export const createPatientApi = async (
  data: CreatePatientDTO,
): Promise<Patient> => {
  const selectedDate = new Date(data.dateOfBirth);
  const now = new Date();

  if (selectedDate > now) {
    throw new Error("Date of birth cannot be in the future.");
  }

  const response = await api.post("/patients/register", data);
  return response.data.data || response.data;
};

// Search patient
export const searchPatientApi = async (
  searchQuery: string,
): Promise<Patient[]> => {
  const query = searchQuery.trim();
  const isMrn = /^MRN/i.test(query);
  const nameParts = query.split(/\s+/);

  const params = new URLSearchParams();

  if (isMrn) {
    params.append("mrn", query);
  } else {
    if (nameParts[0]) params.append("firstName", nameParts[0]);
    if (nameParts[1]) params.append("lastName", nameParts[1]);
  }

  const response = await api.get<PatientListResponse>(
    `/patients/lookup?${params.toString()}`,
  );

  return response.data.data || [];
};

//update patient
export const updatePatientApi = async (
  id: string,
  data: CreatePatientDTO,
): Promise<Patient> => {
  const response = await api.put(`/patients/${id}`, data);
  return response.data.data || response.data;
};
