import axiosInstance from "./axiosInstance";
import API_BASE_URL from "../config";

// ✅ Add a new product
export const addProduct = async (formData) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/products/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error adding product:", error.response?.data);  
      throw new Error(error?.response?.data?.detail?.[0]?.msg || "Error adding product.");
    }
};

// ✅ Get products for a Universal User (NGO)
export const getUserProducts = async (universalUserId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/products/my-products`);
      return response.data.products;  // Adjust based on backend response structure
    } catch (error) {
      console.error("❌ Error fetching products:", error.response?.data);
      throw new Error(error.response?.data?.detail || "Failed to fetch products.");
    }
};

// ✅ Make product live
export const makeProductLive = async (productId) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/products/${productId}/live`);
    return response.data;
  } catch (error) {
    console.error("❌ Error making product live:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to make product live.");
  }
};

// ✅ Make product unlive
export const makeProductUnlive = async (productId) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/products/${productId}/unlive`);
    return response.data;
  } catch (error) {
    console.error("❌ Error making product unlive:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to make product unlive.");
  }
};

// ✅ Delete product
export const deleteProduct = async (productId) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/products/delete/${productId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting product:", error.response?.data);
    throw new Error(error.response?.data?.detail || "Failed to delete product.");
  }
};

// ✅ Fetch pending products
export const getPendingProducts = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/products/pending`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching pending products:", error.response?.data);
      throw new Error(error.response?.data?.detail || "Failed to fetch pending products.");
    }
};

// ✅ Approve product
// Approve product
export const approveProduct = async (productId) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/products/approve/${productId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error approving product:", error.response?.data);
    throw error.response?.data?.detail || "Failed to approve product.";
  }
};


// ✅ Reject product
export const rejectProduct = async (productId, reason) => {
    try {
      const formData = new FormData();
      formData.append("reason", reason);

      const response = await axiosInstance.post(`${API_BASE_URL}/products/reject/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error rejecting product:", error.response?.data);
      throw new Error(error.response?.data?.detail || "Failed to reject product.");
    }
};

// ✅ Fetch all approved and live products
export const getAllProducts = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/products/`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching products:", error.response?.data);
      throw new Error(error.response?.data?.detail || "Failed to fetch products.");
    }
};

// ✅ Fetch product details
export const getProductDetails = async (productId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching product details:", error.response?.data);
      throw new Error(error.response?.data?.detail || "Failed to fetch product details.");
    }
};
  