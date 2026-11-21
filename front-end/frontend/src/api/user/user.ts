import { api } from "../axiosClient";

// ✅ Matches your exact PostgreSQL / Prisma Role enum
export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "GUEST"
  | "NURSE"
  | "DOCTOR"
  | "CASHIER"
  // | "PHARMACIST"
  | "TECHNICIAN";

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

// ✅ Allows optional password when editing an existing staff member
export type UpdateUserPayload = Omit<RegisterUserPayload, "password"> & {
  password?: string;
};

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
  role: UserRole;
  isActive: boolean;
  facilities?: {
    facilityId: string;
    facility?: {
      id: string;
      name: string;
      code: string;
    };
  }[];
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

export const updateUserApi = async (
  id: string,
  data: UpdateUserPayload,
): Promise<RegisterUserResponse> => {
  const response = await api.put<RegisterUserResponse>(
    `/users/update/${id}`,
    data,
  );
  return response.data;
};
