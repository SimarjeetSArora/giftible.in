import axios from "axios";
import API_BASE_URL from "../config";  // Ensure this points to your FastAPI backend

// ✅ Login API (password-based)
export const loginUser = async (contactNumber, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", contactNumber);
    formData.append("password", password);

    const response = await axios.post(`${API_BASE_URL}/token`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Login failed";
  }
};

// ✅ Register User
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register/user`, userData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "User registration failed" };
  }
};
