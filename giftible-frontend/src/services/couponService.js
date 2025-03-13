import axiosInstance from "./axiosInstance";
import API_BASE_URL from "../config";

const getToken = () => localStorage.getItem("access_token");


export const createCoupon = async (couponData) => {
  return axiosInstance.post(`${API_BASE_URL}/checkout/create-coupon`, {
    code: couponData.code,
    discount_percentage: parseFloat(couponData.discount_percentage),
    max_discount: parseFloat(couponData.max_discount),
    usage_limit: couponData.usage_limit,
    minimum_order_amount: parseFloat(couponData.minimum_order_amount),
    is_active: couponData.is_active,
  });
};



export const fetchCoupons = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/checkout/coupons`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("🔑 Token expired. Redirecting to login.");
      localStorage.removeItem("access_token");
      window.location.href = "/login";  // ✅ Redirect to login on token expiration
    }
    throw error.response?.data?.detail || "Error fetching coupons.";
  }
};

export const applyCoupon = async (code) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/checkout/apply-coupon`, { code }, {
    headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
  });
  return response.data;
};

export const removeCoupon = async () => {
  const response = await axiosInstance.post(`${API_BASE_URL}/checkout/remove-coupon`, {}, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return response.data;
};

// ✅ Toggle Coupon Status (Activate/Deactivate)
export const toggleCouponStatus = async (couponId, isActive) => {
    try {
      const response = await axiosInstance.patch(
        `${API_BASE_URL}/checkout/toggle-coupon-status/${couponId}`,
        { is_active: isActive },
        { headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || "Error toggling coupon status.";
    }
  };
  