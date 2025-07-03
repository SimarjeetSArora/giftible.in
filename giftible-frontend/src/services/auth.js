import axiosInstance from "./axiosInstance";
import API_BASE_URL from "../config";

// ✅ Login API
export const loginUser = async (contactNumber, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", contactNumber);
    formData.append("password", password);

    // ✅ Corrected API endpoint for login
    const { data } = await axiosInstance.post(`${API_BASE_URL}/token`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return data;  // { access_token, refresh_token, role, id, first_name, last_name }
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
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    console.error("🚫 No refresh token found.");
    throw new Error("No refresh token found.");
  }

  console.log("🔄 Attempting refresh token request...");
  try {
    const formData = new URLSearchParams();
    formData.append("refresh_token", refreshToken); // ✅ Correct format

    const { data } = await axiosInstance.post(`/refresh-token`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }, // ✅ Fix header format
    });

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
