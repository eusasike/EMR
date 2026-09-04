import { api } from "../axiosClient";

export interface LoginDTO {
  email: string;
  password: string;
}
export interface FacilitySummary {
  id: string;
  code: string;
  name: string;
}
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  facilities?: FacilitySummary[];
}

export interface LoginResponse {
  user: UserProfile;
  accessToken?: string;
  refreshToken?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export const loginApi = async (data: LoginDTO): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data.data || response.data;
};

export const logoutApi = async (refreshToken: string): Promise<void> => {
  await api.post("/auth/logout", { refreshToken });
};
