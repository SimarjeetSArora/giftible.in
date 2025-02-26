import axiosInstance from "./axiosInstance";
import API_BASE_URL from "../config";

// ✅ Login API
export const loginUser = async (contactNumber, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", contactNumber);
    formData.append("password", password);

    const { data } = await axiosInstance.post(`${API_BASE_URL}/token`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return data;  // { access_token, refresh_token, role, id }
  } catch (error) {
    const errorMessage = error?.response?.data?.detail || "Login failed";
    throw new Error(errorMessage);
  }
};

// ✅ Register User
export const registerUser = async (userData) => {
  try {
    const { data } = await axiosInstance.post(`${API_BASE_URL}/register/user`, userData, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    const errorMessage = error?.response?.data?.detail || "User registration failed";
    throw new Error(errorMessage);
  }
};

// 🔄 Refresh Token API
export const refreshTokenAPI = async () => {
  const refreshToken = localStorage.getItem("refresh_token");  // ✅ Use snake_case key

  if (!refreshToken) {
    console.error("🚫 No refresh token in localStorage.");
    throw new Error("No refresh token found.");
  }

  try {
    const { data } = await axiosInstance.post(`/refresh-token`, { refresh_token: refreshToken });

    if (!data.access_token) {
      console.error("🚫 No access token received from refresh API.");
      throw new Error("No access token received.");
    }

    console.log("✅ Successfully refreshed access token.");
    return data.access_token;
  } catch (error) {
    console.error("❌ Refresh token request failed:", error);
    throw new Error("Failed to refresh token.");
  }
};
