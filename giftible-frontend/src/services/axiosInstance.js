import axios from "axios";
import API_BASE_URL from "../config";
import { refreshTokenAPI } from "./auth";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 👉 Request Interceptor: Add Access Token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 👉 Response Interceptor: Handle Token Expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshTokenAPI();

        // ✅ Update access token
        localStorage.setItem("token", newAccessToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);  // 🔄 Retry the request
      } catch (refreshError) {
        console.error("🔒 Token refresh failed:", refreshError);

        // 🧹 Use the correct key for removing refresh token
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");  // ✅ Fixed key
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
