import axiosInstance from "./axiosInstance";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/categories`;

const getToken = () => localStorage.getItem("token");

// ✅ NGO: Create Category
export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post(`${API_URL}/`, categoryData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

// 📥 Public: Fetch Approved Categories
export const fetchApprovedCategories = async () => {
  const response = await axiosInstance.get(`${API_URL}/`);
  return response.data;
};

// 🛡️ Admin: Fetch All Categories
export const fetchAllCategories = async () => {
  const response = await axiosInstance.get(`${API_URL}/all`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

// ✅ Admin: Approve/Reject Category
export const approveCategory = async (categoryId, is_approved) => {
  const response = await axiosInstance.patch(
    `${API_URL}/${categoryId}/approve`,
    { is_approved },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return response.data;
};
