import axiosInstance from "./axiosInstance";
import API_BASE_URL from "../config";

export const addToWishlist = async (productId) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/wishlist/add/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to add product to wishlist";
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/wishlist/remove/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to remove product from wishlist";
  }
};

export const fetchWishlist = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/wishlist`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch wishlist";
  }
};
