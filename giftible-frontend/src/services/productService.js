import axios from "axios";
import API_BASE_URL from "../config";

// Add a new product
export const addProduct = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/products/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding product:", error.response?.data);  // 🔍 Log the full error details
      throw new Error(
        error?.response?.data?.detail?.[0]?.msg || "Error adding product."
      );
    }
  };
  

// Get products for an NGO
export const getNGOProducts = async (ngoId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/ngo/${ngoId}`);
      return response.data.products;  // Adjust based on backend response structure
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Failed to fetch products.");
    }
  };

// Make product live
export const makeProductLive = async (productId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/products/${productId}/live`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to make product live.";
  }
};

// Make product unlive
export const makeProductUnlive = async (productId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/products/${productId}/unlive`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to make product unlive.";
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/products/delete/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to delete product.";
  }
};

// Fetch pending products
export const getPendingProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/pending`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || "Failed to fetch pending products.";
    }
  };
  
  // Approve product
  export const approveProduct = async (productId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/products/approve/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || "Failed to approve product.";
    }
  };
  
  // Reject product
  export const rejectProduct = async (productId, reason) => {
    try {
      const formData = new FormData();
      formData.append("reason", reason);
  
      const response = await axios.post(`${API_BASE_URL}/products/reject/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || "Failed to reject product.";
    }
  };
  
  // Fetch all approved and live products
export const getAllProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || "Failed to fetch products.";
    }
  };
  
  // Fetch product details
  export const getProductDetails = async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || "Failed to fetch product details.";
    }
  };
  