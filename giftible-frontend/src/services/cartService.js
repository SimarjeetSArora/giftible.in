import axios from "axios";
import API_BASE_URL from "../config";

// Retrieve token from localStorage
const getToken = () => localStorage.getItem("token");

// Add or update an item in the cart
export const addToCart = async (productId, quantity) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cart/add`,
      { product_id: productId, quantity },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error adding item to cart.";
  }
};

// Fetch the user’s cart
export const fetchCart = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cart/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data.cart_items;
  } catch (error) {
    throw error.response?.data?.detail || "Error fetching cart.";
  }
};

// Remove an item from the cart
export const removeFromCart = async (productId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/cart/remove/${productId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error removing item.";
  }
};

// Clear the entire cart
export const clearCart = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/cart/clear`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Error clearing cart.";
  }
};
