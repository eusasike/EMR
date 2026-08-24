import { api } from "./../axiosClient";

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: string;
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  phoneNumber?: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  address?: string;
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
  const response = await api.post("/patients", data);
  return response.data.data || response.data;
};
