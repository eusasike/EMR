import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// 1. Create client configured for Vite and HTTP-Only cookies
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial: Tells the browser to automatically include HTTP-Only cookies
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

// Helper to resolve/reject all queued requests after token refresh
const processQueue = (error: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// 2. Response Interceptor for handling 401 Unauthorized & refreshing tokens
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip handling if it's not a 401 error or if this request has already been retried
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    // Don't intercept 401 errors coming directly from the login or refresh endpoints
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while a refresh attempt is active
    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Execute refresh request using raw axios with credentials enabled.
      // The browser automatically attaches the 'refreshToken' HTTP-Only cookie.
      await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      // Refresh successful: Process any pending requests in queue
      processQueue(null);

      // Re-run the original request (browser automatically attaches the updated cookies)
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);

      // If refresh fails (token expired/invalid), redirect to login page
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
