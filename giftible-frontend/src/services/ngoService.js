// src/services/ngoService.js
import axiosInstance from "./axiosInstance";
import API_BASE_URL from "../config";

// 🔹 Fetch all products listed by a specific user (NGO)
export const fetchProductsByUser = async (universalUserId) => {
  try {
    console.log("Fetching products for Universal User ID:", universalUserId); // 🔍 Debugging
    const response = await axiosInstance.get(`${API_BASE_URL}/products/ngo/${universalUserId}`);

    console.log("✅ API Response:", response.data); // 🔍 Log response to check structure
    return response.data; // ✅ Ensure correct data is returned
  } catch (error) {
    console.error("Error fetching products by user:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Failed to fetch products by user.");
  }
};




// 🔹 Fetch all approved NGOs
export const fetchAllNGOs = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/ngo/approved`); // ✅ Ensure correct endpoint
    return response.data; // ✅ Expected response: [{ id, ngo_name, logo }]
  } catch (error) {
    console.error("Error fetching approved NGOs:", error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || "Failed to fetch approved NGOs.");
  }
};
