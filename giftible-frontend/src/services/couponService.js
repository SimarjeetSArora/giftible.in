import axios from "axios";
import API_BASE_URL from "../config";

const getToken = () => localStorage.getItem("token");

export const createCoupon = async (couponData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token not found.");
  
    const response = await axios.post(`${API_BASE_URL}/checkout/create-coupon`, couponData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  
    return response.data;
  };


export const fetchCoupons = async () => {
  const response = await axios.get(`${API_BASE_URL}/checkout/coupons`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

export const applyCoupon = async (code) => {
  const response = await axios.post(`${API_BASE_URL}/checkout/apply-coupon`, { code }, {
    headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
  });
  return response.data;
};

export const removeCoupon = async () => {
  const response = await axios.post(`${API_BASE_URL}/checkout/remove-coupon`, {}, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

// ✅ Toggle Coupon Status (Activate/Deactivate)
export const toggleCouponStatus = async (couponId, isActive) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/checkout/toggle-coupon-status/${couponId}`,
        { is_active: isActive },
        { headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || "Error toggling coupon status.";
    }
  };
  