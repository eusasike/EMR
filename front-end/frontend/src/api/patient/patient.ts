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
