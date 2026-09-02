import { api } from "../axiosClient";

export type UserRole =
  | "ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "LAB_TECH"
  | "PHARMACIST"
  | "RECEPTIONIST"
  | "CLINICAL_OFFICER";

export interface RegisterUserPayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  facilityId?: string;
  isActive?: boolean;
}

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
}

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  facility?: {
    name: string;
    code: string;
  };
  createdAt: string;
}

export const fetchStaffUsersApi = async (): Promise<UserItem[]> => {
  const res = await api.get("/users/view");
  return res.data.data || res.data;
};

export const registerStaffUserApi = async (
  payload: RegisterUserPayload,
): Promise<RegisterUserResponse> => {
  const response = await api.post<RegisterUserResponse>(
    "/users/register",
    payload,
  );
  return response.data;
};

//update user
export const updateUserApi = async (
  id: string,
  data: RegisterUserPayload,
): Promise<RegisterUserResponse> => {
  const response = await api.put<RegisterUserResponse>(
    `/users/update/${id}`,
    data,
  );
  return response.data;
};
