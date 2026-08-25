import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ============================================================================
// REQUEST INTERCEPTOR: Attach Authorization & Active Facility Context Headers
// ============================================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");
    const facilityId = localStorage.getItem("facilityId");
    const facilityCode = localStorage.getItem("facilityCode");

    // Attach Bearer Access Token
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Attach Facility Context Headers for scoped clinical & administrative queries
    if (facilityId && config.headers) {
      config.headers["x-facility-id"] = facilityId;
    }

    if (facilityCode && config.headers) {
      config.headers["x-facility-code"] = facilityCode;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================================
// RESPONSE INTERCEPTOR: Handle Token Expiration & Authentication Errors
// ============================================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (e.g., Expired Token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Attempt token renewal
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.data?.accessToken || data.accessToken;
        if (!newAccessToken) {
          throw new Error("Failed to retrieve new access token");
        }

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Clear stored auth and redirect to login if renewal fails
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("facilityId");
        localStorage.removeItem("facilityCode");

        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
