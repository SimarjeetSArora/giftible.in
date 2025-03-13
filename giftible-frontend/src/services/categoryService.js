import axiosInstance from "./axiosInstance";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;

const getToken = () => localStorage.getItem("token");

// ✅ NGO: Create Category
export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post(`${API_URL}/categories/`, categoryData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

// 📥 Public: Fetch Approved Categories
export const fetchApprovedCategories = async () => {
  const response = await axiosInstance.get(`${API_URL}/categories/`);
  return response.data;
};

// 🛡️ Admin: Fetch All Categories
export const fetchAllCategories = async () => {
  const response = await axiosInstance.get(`${API_URL}/categories/all`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

// ✅ Admin: Approve/Reject Category
export const approveCategory = async (categoryId, is_approved) => {
  const response = await axiosInstance.patch(
    `${API_URL}/categories/${categoryId}/approve`,
    { is_approved },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return response.data;
};


export const rejectCategory = async (categoryId, reason) => {
  const response = await axiosInstance.delete(
    `${API_URL}/categories/${categoryId}/reject`,
    {
      data: { reason }, // 🔹 Pass reason in request body
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  return response.data;
};